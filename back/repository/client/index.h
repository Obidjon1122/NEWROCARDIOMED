#ifndef REPOSITORIES_CLIENT_REPOSITORY_H
#define REPOSITORIES_CLIENT_REPOSITORY_H

#include "../../domain/client/index.h"
#include "../../domain/common/index.h"
#include "../../infrastructure/storage/index.h"
#include <memory>
#include <pqxx/pqxx>
#include <vector>

namespace Repositories
{

class ClientRepository
{
   private:
    Infrastructure::Storage::DatabaseConnection* dbConnection_;

    std::shared_ptr<Domain::Client> mapRowToClient(const pqxx::row& row);
    std::string buildSelectQuery(const std::string& whereClause = "", const std::string& orderBy = "updated_at DESC",
                                 const std::string& limit = "");
    std::string buildSelectQueryProtocol(const std::string& whereClause = "", const std::string& orderBy = "id ASC",
                                         const std::string& limit = "");

   public:
    explicit ClientRepository(Infrastructure::Storage::DatabaseConnection* dbConnection);

    std::shared_ptr<Domain::Client> create(const Domain::Client& user);
    std::shared_ptr<Domain::Client> getById(int64_t id);
    std::shared_ptr<Domain::Client> getByPhone(const std::string& phone);
    std::shared_ptr<Domain::Client> update(std::shared_ptr<Domain::Client> client);
    bool                            deleteById(int64_t id);

    Common::PaginationResponse<Domain::Client> getAll(const Common::PaginationRequest& request,
                                                      const std::string&               text);
    Common::PaginationResponse<Domain::Client> getAllClientByProtocolId(const Common::PaginationRequest& request,
                                                                        int64_t id, const std::string& text);

    int  getTotalCount();
    bool existsById(int64_t id);
};

}  // namespace Repositories

#endif  // REPOSITORIES_CLIENT_REPOSITORY_H
