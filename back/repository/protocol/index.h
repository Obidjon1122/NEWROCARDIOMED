#ifndef REPOSITORIES_PROTOCOL_REPOSITORIES_H
#define REPOSITORIES_PROTOCOL_REPOSITORIES_H

#include "../../domain/common/index.h"
#include "../../domain/protocol/index.h"
#include "../../infrastructure/storage/index.h"
#include <memory>
#include <nlohmann/json.hpp>
#include <pqxx/pqxx>
#include <vector>
#include <string>
#ifdef QT_CORE_LIB
#include <QString>
#include <QMap>
#include <QDebug>
#else
#include <string>
#include <map>
#include <iostream>
using QString = std::string;
template<typename K, typename V>
using QMap = std::map<K, V>;
#define qWarning() std::cerr
#define qInfo() std::cout
#define qDebug() std::cout
#endif

using json = nlohmann::json;

namespace Repositories
{
class ProtocolRepository
{
   private:
    Infrastructure::Storage::DatabaseConnection* dbConnection_;

    std::shared_ptr<Domain::Protocol> mapRowToProtocol(const pqxx::row& row);
    Common::Protocols                 mapRowToProtocolDashboard(const pqxx::row& row);
    Common::ProtocolForms             mapRowToProtocolClientIdAndProtocolId(const pqxx::row& row);

    std::string buildSelectQuery(const std::string& whereClause = "", const std::string& orderBy = "id ASC",
                                 const std::string& limit = "");
    std::string buildSelectQueryClientIdAndProtocolId(const std::string& whereClause = "",
                                                      const std::string& orderBy     = "id ASC",
                                                      const std::string& limit       = "");
    std::string buildSelectQueryClientId(const std::string& whereClause = "", const std::string& orderBy = "id ASC",
                                         const std::string& limit = "");

   public:
    explicit ProtocolRepository(Infrastructure::Storage::DatabaseConnection* dbConnection);
    std::shared_ptr<Domain::Protocol> getById(int64_t id);
    Common::ProtocolDashboardResponse getAllByDoctorId(int64_t id);
    Common::ProtocolFormsResponse     getClientIdAndProtocolId(Common::PaginationRequest request, int64_t clinetId,
                                                               int64_t protocolId,std::string date);
    Common::ProtocolFormsResponse     getClientId(Common::PaginationRequest request, int64_t clinetId);

    QMap<QString, QString> getProtoclFormByClientIdProtocolId(int64_t protocolFormId, int64_t clientId, int64_t doctorId);
    QMap<QString, QString> parseProtocolForm(const json& j, const std::string &date);
    void createProtocolForm(int64_t clientId, int64_t protocolId, json protocolForm);

    bool                              existsById(int64_t id);
};
}  // namespace Repositories

#endif
