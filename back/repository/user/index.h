#ifndef REPOSITORIES_USER_REPOSITORY_H
#define REPOSITORIES_USER_REPOSITORY_H

#include "../../domain/common/index.h"
#include "../../domain/user/index.h"
#include "../../infrastructure/storage/index.h"
#include <memory>
#include <pqxx/pqxx>
#include <vector>

namespace Repositories
{

class UserRepository
{
   private:
    Infrastructure::Storage::DatabaseConnection* dbConnection_;

    std::shared_ptr<Domain::User> mapRowToUser(const pqxx::row& row);
    std::string                   buildSelectQuery(std::stringstream& query, const std::string& whereClause = "",
                                                   const std::string& orderBy = "id ASC", const std::string& limit = "");

   public:
    explicit UserRepository(Infrastructure::Storage::DatabaseConnection* dbConnection);

    std::shared_ptr<Domain::User> create(const Domain::User& user);
    std::shared_ptr<Domain::User> getById(int64_t id);
    std::shared_ptr<Domain::User> getByPhone(const std::string& phone);
    Common::LoginResponse         getLoginByPhone(const std::string& phone);
    std::shared_ptr<Domain::User> update(const Domain::User& user);
    bool                          deleteById(int64_t id);

    Common::PaginationResponse<Domain::User>   getAll(const Common::PaginationRequest& request);
    std::vector<std::shared_ptr<Domain::User>> getByRole(const std::string& role);

    int  getTotalCount();
    bool existsById(int64_t id);
    bool existsByPhone(const std::string& phone);
};

}  // namespace Repositories

#endif  // REPOSITORIES_USER_REPOSITORY_IMPL_H
