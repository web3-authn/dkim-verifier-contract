#[cfg(test)]
mod tests;
mod api;
mod crypto;
mod dns;
mod parsers;
mod verify_dkim;

use crate::api::{handle_request, RequestType};
use outlayer::env as outlayer_env;

fn main() -> Result<(), Box<dyn std::error::Error>> {

    let input_string = outlayer_env::input_string().unwrap_or_default();

    let request: RequestType = serde_json::from_str(&input_string)?;

    let response = handle_request(request);

    outlayer_env::output_string(&serde_json::to_string(&response)?);

    Ok(())
}
