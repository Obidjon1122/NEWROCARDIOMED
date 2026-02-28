#ifndef DOMAIN_PROTOCOLS_H
#define DOMAIN_PROTOCOLS_H

// Libraries
#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <cstdint>

namespace Domain
{
class Protocol
{
   private:
    int64_t                                         id_;
    int64_t                                         doctorId_;
    std::string                                     title_;
    std::map<std::string, std::vector<std::string>> protocolForm_;
    std::string                                     createdAt_;
    std::string                                     updatedAt_;

   public:
    Protocol()
    {
        id_       = 0;
        doctorId_ = 0;
    }

    Protocol(const std::string& title, const int64_t& doctorId);

    int64_t getId() const
    {
        return id_;
    }

    std::string getTitle() const
    {
        return title_;
    }

    int64_t getDoctorId() const
    {
        return doctorId_;
    }

    std::map<std::string, std::vector<std::string>> getProtocolForm() const
    {
        return protocolForm_;
    }

    std::string getUpdatedAt() const
    {
        return updatedAt_;
    }

    std::string getCreatedAt() const
    {
        return createdAt_;
    }

    void setId(int64_t id)
    {
        id_ = id;
    }

    void setTitle(const std::string& title)
    {
        title_ = title;
    }

    void setDoctorId(const int64_t& doctorId)
    {
        doctorId_ = doctorId;
    }

    void setCreatedAt(const std::string& createdAt)
    {
        createdAt_ = createdAt;
    }

    void setUpdatedAt(const std::string& updatedAt)
    {
        updatedAt_ = updatedAt;
    }

    void setProtocolForm(const std::map<std::string, std::vector<std::string>>& protocolForm)
    {
        protocolForm_ = protocolForm;
    }

    bool isValid() const;

    void printInfo() const;
};
}  // namespace Domain

#endif
