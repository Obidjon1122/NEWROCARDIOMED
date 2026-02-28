#pragma once

#include "../user/index.h"
#include "../client/index.h"
#include <memory>
#include <string>
#include <vector>

namespace Common
{

struct PaginationRequest {
    int         page      = 1;
    int         pageSize  = 10;
    std::string sortBy    = "id";
    std::string sortOrder = "ASC";

    int getOffset() const
    {
        return (page - 1) * pageSize;
    }
};

struct ProtocolForms {
    int64_t     protocolFormId = 0;
    int64_t     protocolId      = 0;
    std::string protocolTitle   = "";
    std::string created_at      = "";
};

struct ProtocolFormsResponse {
    std::vector<ProtocolForms> items;
    int                        totalCount  = 0;
    int                        totalPages  = 0;
    int                        currentPage = 1;
    int                        pageSize    = 10;
    bool                       hasNext     = false;
    bool                       hasPrevious = false;
};

struct Protocols {
    int64_t     protocolId    = 0;
    std::string protocolTitle = "";
};

struct ProtocolDashboardResponse {
    std::vector<Protocols> items;
};

template <typename T>
struct PaginationResponse {
    std::vector<std::shared_ptr<T>> items;
    int                             totalCount  = 0;
    int                             totalPages  = 0;
    int                             currentPage = 1;
    int                             pageSize    = 10;
    bool                            hasNext     = false;
    bool                            hasPrevious = false;
};

struct LoginResponse {
    bool                          error        = false;
    std::string                   errorMessage = " ";
    std::shared_ptr<Domain::User> user;
};

struct CreateClientResponse {
    bool                          error        = false;
    std::string                   errorMessage = " ";
    int64_t clientId = 0;
};




}  // namespace Common

