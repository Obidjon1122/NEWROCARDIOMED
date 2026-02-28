#include "security.h"

#include <openssl/sha.h>
#include <array>
#include <cstdlib>
#include <iomanip>
#include <sstream>
#include <string>

namespace
{
std::string hexEncode(const unsigned char* data, std::size_t len)
{
    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    for (std::size_t i = 0; i < len; ++i) {
        oss << std::setw(2) << static_cast<int>(data[i]);
    }
    return oss.str();
}

std::string readPepper()
{
    const char* envPepper = std::getenv("AUTH_PEPPER");
    return envPepper ? std::string(envPepper) : std::string{};
}
}  // namespace

namespace Security
{

std::string hashPassword(const std::string& password, const std::string& phone)
{
    const std::string pepper = readPepper();
    const std::string salted = password + ":" + phone + ":" + pepper;

    std::array<unsigned char, SHA256_DIGEST_LENGTH> digest{};
    SHA256(reinterpret_cast<const unsigned char*>(salted.data()), salted.size(), digest.data());
    return hexEncode(digest.data(), digest.size());
}

}  // namespace Security
