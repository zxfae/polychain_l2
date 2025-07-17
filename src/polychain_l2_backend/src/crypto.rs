use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub fn calculate_hash(data: &str) -> String {
    let mut hasher = DefaultHasher::new();
    data.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}

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
