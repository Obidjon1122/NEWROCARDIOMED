#pragma once

#include <string>

namespace Security
{

// Hash the password using SHA-256 with a lightweight salt (phone) and optional pepper.
// NOTE: For production, migrate to per-user random salt stored in DB and a stronger KDF (e.g., bcrypt/argon2).
std::string hashPassword(const std::string& password, const std::string& phone);

}  // namespace Security
