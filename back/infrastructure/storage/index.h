#ifndef INFRASTRUCTURE_STORAGE_INDEX_H
#define INFRASTRUCTURE_STORAGE_INDEX_H

#include "../../config/storage/index.h"
#include <memory>
#include <pqxx/pqxx>
#include <string>

namespace Infrastructure
{
namespace Storage
{

class DatabaseConnection
{
   private:
    std::unique_ptr<pqxx::connection> connection_;
    Config::Storage::DatabaseConfig   config_;
    bool                              isConnected_;

   public:
    DatabaseConnection();
    ~DatabaseConnection();
    bool              connect();
    void              disconnect();
    bool              isConnected() const;
    pqxx::connection* getConnection();
    void              printConnectionInfo() const;
};

}  // namespace Storage
}  // namespace Infrastructure

#endif  // INFRASTRUCTURE_STORAGE_INDEX_H
