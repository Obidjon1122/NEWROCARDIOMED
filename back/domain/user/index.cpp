#include "index.h"

#include <iostream>
#include <regex>

namespace Domain
{

User::User() : id_(0), role_("admin") {}

User::User(const std::string& firstName, const std::string& lastName, const std::string& patronymicName,
           const std::string& gender, const std::string& password, const std::string& phone, const std::string& role)
    : id_(0),
      firstName_(firstName),
      lastName_(lastName),
      patronymicName_(patronymicName),
      gender_(gender),
      password_(password),
      phone_(phone),
      role_(role)
{
}

std::string User::getFullName() const
{
    return firstName_ + " " + lastName_ + " " + patronymicName_;
}

bool User::isValid() const
{
    if (firstName_.empty() || firstName_.length() > 20) {
        return false;
    }

    if (lastName_.empty() || lastName_.length() > 20) {
        return false;
    }

    if (patronymicName_.empty() || patronymicName_.length() > 20) {
        return false;
    }

    if (gender_.empty() || (gender_ != "male" && gender_ != "female")) {
        return false;
    }

    if (password_.empty() || password_.length() < 6) {
        return false;
    }

    if (phone_.empty() || phone_.length() > 20) {
        return false;
    }

    if (role_ != "admin" && role_ != "doctor") {
        return false;
    }

    return true;
}

void User::printInfo() const
{
    std::cout << "User ID: " << id_ << std::endl;
    std::cout << "Name: " << getFullName() << std::endl;
    std::cout << "Gender: " << gender_ << std::endl;
    std::cout << "Phone: " << phone_ << std::endl;
    std::cout << "Role: " << role_ << std::endl;
    std::cout << "Created: " << createdAt_ << std::endl;
}

}  // namespace Domain