#include "index.h"

#include <iostream>
#include <regex>

namespace Domain
{

Client::Client() : id_(0) {}

Client::Client(const std::string& firstName, const std::string& lastName,
               const std::string& gender, const std::string& phone, const std::string& birth_date,
               const std::string& region)
    : id_(0),
      firstName_(firstName),
      lastName_(lastName),
      gender_(gender),
      phone_(phone),
      birth_date_(birth_date),
      region_(region)
{
}

std::string Client::getFullName() const
{
    return firstName_ + " " + lastName_;
}

bool Client::isValid() const
{
    if (firstName_.empty() || firstName_.length() > 20)
        return false;
    if (lastName_.empty() || lastName_.length() > 20)
        return false;
    if (gender_.empty() || (gender_ != "male" && gender_ != "female"))
        return false;
    if (phone_.empty() || phone_.length() > 20)
        return false;
    if (birth_date_.empty())
        return false;
    if (region_.empty())
        return false;

    return true;
}

void Client::printInfo() const
{
    std::cout << "ID: " << id_ << std::endl;
    std::cout << "Name: " << getFullName() << std::endl;
    std::cout << "Gender: " << gender_ << std::endl;
    std::cout << "Phone: " << phone_ << std::endl;
    std::cout << "Birth Date: " << birth_date_ << std::endl;
    std::cout << "Region: " << region_ << std::endl;
    std::cout << "Created: " << createdAt_ << std::endl;
}

}  // namespace Domain
