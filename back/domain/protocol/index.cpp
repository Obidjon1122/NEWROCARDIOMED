#include "index.h"

namespace Domain
{
Protocol::Protocol(const std::string& title, const int64_t& doctorId) : title_(title), doctorId_(doctorId){};

bool Protocol::isValid() const
{
    if (title_.empty() || title_.size() > 255) {
        return false;
    }
    return true;
}

void Protocol::printInfo() const
{
    std::cout << "Protocol ID: " << id_ << std::endl;
    std::cout << "Title: " << title_ << std::endl;
    std::cout << "Doctor ID: " << doctorId_ << std::endl;
    std::cout << "Created: " << createdAt_ << std::endl;
}
}  // namespace Domain