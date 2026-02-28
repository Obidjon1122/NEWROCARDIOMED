#ifndef DOMAIN_USER_H
#define DOMAIN_USER_H

#include <memory>
#include <string>
#include <vector>

namespace Domain
{

class User
{
   private:
    int64_t     id_;
    std::string firstName_;
    std::string lastName_;
    std::string patronymicName_;
    std::string gender_;
    std::string password_;
    std::string phone_;
    std::string role_;
    std::string createdAt_;
    std::string updatedAt_;

   public:
    User();
    User(const std::string& firstName, const std::string& lastName, const std::string& patronymicName,
         const std::string& gender, const std::string& password, const std::string& phone, const std::string& role);

    int64_t getId() const
    {
        return id_;
    }

    const std::string& getFirstName() const
    {
        return firstName_;
    }

    const std::string& getLastName() const
    {
        return lastName_;
    }

    const std::string& getPatronymicName() const
    {
        return patronymicName_;
    }

    const std::string& getGender() const
    {
        return gender_;
    }

    const std::string& getPassword() const
    {
        return password_;
    }

    const std::string& getPhone() const
    {
        return phone_;
    }

    const std::string& getRole() const
    {
        return role_;
    }

    const std::string& getCreatedAt() const
    {
        return createdAt_;
    }

    const std::string& getUpdatedAt() const
    {
        return updatedAt_;
    }

    void setId(int64_t id)
    {
        id_ = id;
    }

    void setFirstName(const std::string& firstName)
    {
        firstName_ = firstName;
    }

    void setLastName(const std::string& lastName)
    {
        lastName_ = lastName;
    }

    void setPatronymicName(const std::string& patronymicName)
    {
        patronymicName_ = patronymicName;
    }

    void setGender(const std::string& gender)
    {
        gender_ = gender;
    }

    void setPassword(const std::string& password)
    {
        password_ = password;
    }

    void setPhone(const std::string& phone)
    {
        phone_ = phone;
    }

    void setRole(const std::string& role)
    {
        role_ = role;
    }

    void setCreatedAt(const std::string& createdAt)
    {
        createdAt_ = createdAt;
    }

    void setUpdatedAt(const std::string& updatedAt)
    {
        updatedAt_ = updatedAt;
    }

    std::string getFullName() const;
    bool        isValid() const;
    void        printInfo() const;
};

}  // namespace Domain

#endif  // DOMAIN_USER_H