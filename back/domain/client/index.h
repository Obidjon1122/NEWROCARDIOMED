#ifndef DOMAIN_CLIENT_H
#define DOMAIN_CLIENT_H

#include <memory>
#include <string>
#include <vector>

namespace Domain
{

class Client
{
   private:
    int64_t     id_;
    std::string firstName_;
    std::string lastName_;
    std::string gender_;
    std::string phone_;
    std::string birth_date_;
    std::string region_;
    std::string createdAt_;
    std::string updatedAt_;

   public:
    Client();
    Client(const std::string& firstName, const std::string& lastName,
           const std::string& gender, const std::string& phone, const std::string& birth_date,
           const std::string& region);

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

    const std::string& getGender() const
    {
        return gender_;
    }

    const std::string& getPhone() const
    {
        return phone_;
    }

    const std::string& getBirthDate() const
    {
        return birth_date_;
    }

    const std::string& getRegion() const
    {
        return region_;
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

    void setGender(const std::string& gender)
    {
        gender_ = gender;
    }

    void setPhone(const std::string& phone)
    {
        phone_ = phone;
    }

    void setBirthDate(const std::string& birth_date)
    {
        birth_date_ = birth_date;
    }

    void setRegion(const std::string& region)
    {
        region_ = region;
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

#endif  // DOMAIN_CLIENT_H
