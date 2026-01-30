use crate::{
    ext_outlayer, ext_self,
    EmailDkimVerifier, ExecutionParams, OutlayerInputArgs,
    VerificationResult, OutlayerWorkerResponse,
    MIN_DEPOSIT,
    VERIFY_ENCRYPTED_EMAIL_METHOD,
    SecretsReference,
};
use near_sdk::serde_json::{self, json};
use near_sdk::{env, AccountId, NearToken, Promise, PromiseError};

#[derive(near_sdk::serde::Deserialize)]
#[serde(crate = "near_sdk::serde")]
struct VerifyEncryptedEmailResponse {
    verified: bool,
    account_id: String,
    new_public_key: String,
    #[serde(default)]
    from_address_hash: Vec<u8>,
    email_timestamp_ms: Option<u64>,
    #[serde(default)]
    request_id: String,
    error: Option<String>,
}

/// Context forwarded as AEAD associated data to the Outlayer worker
/// by the EmailDKIMVerifier contract. This is used when decrypting
/// the encrypted email blob.
#[near_sdk::near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct AeadContext {
    pub account_id: String,
    pub network_id: String,
    pub payer_account_id: String,
}

/// Internal helper: encrypted/TEE DKIM verification request path.
pub fn request_email_verification_private_inner(
    contract: &mut EmailDkimVerifier,
    payer_account_id: AccountId,
    encrypted_email_blob: serde_json::Value,
    aead_context: AeadContext,
    request_id: Option<String>,
) -> Promise {
    let caller = env::predecessor_account_id();
    let attached = env::attached_deposit().as_yoctonear();
    assert!(
        attached >= MIN_DEPOSIT,
        "Attach at least 0.01 NEAR for Outlayer execution"
    );

    let outlayer_deposit = MIN_DEPOSIT;
    let refund = attached.saturating_sub(outlayer_deposit);

    if refund > 0 {
        env::log_str(&format!(
            "Refunding {} yoctoNEAR of unused DKIM fees to {}",
            refund, caller
        ));
        let _ = Promise::new(caller.clone()).transfer(NearToken::from_yoctonear(refund));
    }

    // The `context` is forwarded to the worker under the `context` key.
    // The worker uses this JSON object as AEAD AAD for ChaCha20‑Poly1305
    // after serializing it with serde_json.
    // Expected keys (alphabetical for canonical AAD):
    //   account_id, network_id, payer_account_id.
    let request_id = request_id.unwrap_or_default().trim().to_string();
    let input_args = OutlayerInputArgs::new(
        VERIFY_ENCRYPTED_EMAIL_METHOD,
        serde_json::json!({
            "encrypted_email_blob": encrypted_email_blob,
            "context": json!({
                // alphabetized
                "account_id": aead_context.account_id,
                "network_id": aead_context.network_id,
                "payer_account_id": aead_context.payer_account_id,
            }),
            "request_id": request_id.clone(),
        }),
    );
    let input_payload = input_args.to_json_string();

    let source = contract.resolve_outlayer_source();

    let resource_limits = json!({
        "max_instructions": 10_000_000_000u64,
        "max_memory_mb": 256u32,
        "max_execution_seconds": 60u64
    });

    let secrets = contract.resolve_secrets_reference();

    let params_exec = ExecutionParams {
        force_rebuild: false,
        compile_only: false,
        store_on_fastfs: false,
    };

    ext_outlayer::ext(contract.get_outlayer_contract_id())
        .with_attached_deposit(NearToken::from_yoctonear(outlayer_deposit))
        .with_unused_gas_weight(1)
        .request_execution(
            source,
            resource_limits,
            input_payload,
            Some(secrets),
            "Json".to_string(),
            Some(payer_account_id),
            Some(params_exec),
        )
        .then(
            ext_self::ext(env::current_account_id())
                .with_unused_gas_weight(1)
                .on_email_verification_private_result(caller, request_id),
        )
}

/// Internal helper: encrypted/TEE DKIM verification callback path.
pub fn on_email_verification_private_result(
    requested_by: AccountId,
    request_id: String,
    result: Result<Option<serde_json::Value>, PromiseError>,
) -> VerificationResult {
    let _ = requested_by;

    let value = match result {
        Ok(Some(v)) => v,
        _ => {
            return VerificationResult::failure(&request_id, "outlayer_execution_failed");
        }
    };

    let worker_response: OutlayerWorkerResponse = match serde_json::from_value(value.clone()) {
        Ok(r) => r,
        Err(e) => {
            env::log_str(&format!("Failed to parse worker response (private): {e}"));
            return VerificationResult::failure(&request_id, "invalid_worker_response");
        }
    };

    if worker_response.method != VERIFY_ENCRYPTED_EMAIL_METHOD {
        env::log_str(&format!(
            "Unexpected worker method in on_email_verification_private_result: {}",
            worker_response.method
        ));
        return VerificationResult::failure(
            &request_id,
            format!(
                "unexpected_worker_method: {}",
                worker_response.method
            ),
        );
    }

    let verify_params: VerifyEncryptedEmailResponse =
        match serde_json::from_value(worker_response.response.clone()) {
            Ok(p) => p,
            Err(e) => {
                env::log_str(&format!("Failed to parse {VERIFY_ENCRYPTED_EMAIL_METHOD} response: {e}"));
                return VerificationResult::failure(&request_id, "invalid_verify_response");
            }
        };

    if let Some(err) = verify_params.error.as_deref() {
        env::log_str(&format!("{VERIFY_ENCRYPTED_EMAIL_METHOD} worker error: {err}"));
    }

    let final_request_id = if verify_params.request_id.trim().is_empty() {
        request_id
    } else {
        verify_params.request_id.clone()
    };

    let vr = VerificationResult {
        verified: verify_params.verified,
        account_id: verify_params.account_id,
        new_public_key: verify_params.new_public_key,
        from_address_hash: verify_params.from_address_hash,
        email_timestamp_ms: verify_params.email_timestamp_ms,
        request_id: final_request_id.clone(),
        error: verify_params.error.clone(),
    };
    vr
}
