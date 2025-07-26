/// Cryptographically secure hash calculation using Blake3
/// This is critical for transaction hashes, block hashes, and all security-sensitive operations
pub fn calculate_hash(data: &str) -> String {
    let hash = blake3::hash(data.as_bytes());
    hex::encode(hash.as_bytes())
}

/// Calculate hash from raw bytes (more efficient for binary data)
pub fn calculate_hash_bytes(data: &[u8]) -> String {
    let hash = blake3::hash(data);
    hex::encode(hash.as_bytes())
}

/// Calculate hash and return as bytes (for performance-critical operations)
pub fn calculate_hash_raw(data: &[u8]) -> [u8; 32] {
    blake3::hash(data).into()
}

/*
pub fn calculate_merkle_root(hashes: &[String]) -> String {
    if hashes.is_empty() {
        return String::new();
    }

    if hashes.len() == 1 {
        return hashes[0].clone();
    }

    let mut current_level = hashes.to_vec();

    while current_level.len() > 1 {
        let mut next_level = Vec::new();

        for chunk in current_level.chunks(2) {
            let combined = if chunk.len() == 2 {
                format!("{}{}", chunk[0], chunk[1])
            } else {
                format!("{}{}", chunk[0], chunk[0])
            };
            next_level.push(calculate_hash(&combined));
        }

        current_level = next_level;
    }

    current_level[0].clone()
}
*/
