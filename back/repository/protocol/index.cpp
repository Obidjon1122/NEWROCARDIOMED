#include "index.h"

#include <iostream>
#include <sstream>
#include <unordered_set>
#include <algorithm>
#ifndef QT_CORE_LIB
#include <functional>
#endif

namespace Repositories
{

ProtocolRepository::ProtocolRepository(Infrastructure::Storage::DatabaseConnection* dbConnection)
    : dbConnection_(dbConnection)
{
}

namespace
{
std::string sanitizeOrderBy(const Common::PaginationRequest& request)
{
    static const std::unordered_set<std::string> allowed = {"id", "created_at", "protocol_id"};

    std::string sortBy = request.sortBy;
    if (!allowed.count(sortBy)) {
        sortBy = "id";
    }
    std::string order = request.sortOrder;
    std::transform(order.begin(), order.end(), order.begin(), ::toupper);
    if (order != "DESC") {
        order = "ASC";
    }
    return "pf." + sortBy + " " + order;
}
}
std::shared_ptr<Domain::Protocol> ProtocolRepository::mapRowToProtocol(const pqxx::row& row)
{
    auto protocol = std::make_shared<Domain::Protocol>();

    protocol->setId(row["id"].as<int64_t>());
    protocol->setTitle(row["title"].as<std::string>());
    protocol->setDoctorId(row["doctor_id"].as<int64_t>());
    protocol->setCreatedAt(row["created_at"].as<std::string>());
    protocol->setUpdatedAt(row["updated_at"].as<std::string>());

    if (!row["protocol_form"].is_null()) {
        std::string                                     jsonText = row["protocol_form"].as<std::string>();
        std::map<std::string, std::vector<std::string>> parsedMap;

        try {
            json j = json::parse(jsonText);

            for (auto& [key, value] : j.items()) {
                std::vector<std::string> vec;

                if (value.is_array()) {
                    for (auto& item : value) {
                        vec.push_back(item.get<std::string>());
                    }
                }

                parsedMap[key] = vec;
            }

            protocol->setProtocolForm(parsedMap);
        } catch (const std::exception& e) {
            std::cerr << "JSON parse error: " << e.what() << std::endl;
        }
    }

    return protocol;
}

Common::Protocols ProtocolRepository::mapRowToProtocolDashboard(const pqxx::row& row)
{
    Common::Protocols protocol;

    protocol.protocolId    = (row["id"].as<int64_t>());
    protocol.protocolTitle = (row["title"].as<std::string>());

    return protocol;
}

Common::ProtocolForms ProtocolRepository::mapRowToProtocolClientIdAndProtocolId(const pqxx::row& row)
{
    Common::ProtocolForms protocolForms;

    protocolForms.protocolFormId  = (row["id"].as<int64_t>());
    protocolForms.protocolId      = (row["protocol_id"].as<int64_t>());
    protocolForms.protocolTitle   = (row["title"].as<std::string>());
    protocolForms.created_at      = (row["created_at"].as<std::string>());
    std::cout << protocolForms.created_at << " " << protocolForms.protocolFormId << " "
              << "REPOSITORY" << std::endl;
    return protocolForms;
}

std::string ProtocolRepository::buildSelectQuery(const std::string& whereClause, const std::string& orderBy,
                                                 const std::string& limit)
{
    std::stringstream query;
    query << "SELECT id, title, doctor_id, protocol_form::jsonb, "
          << "created_at, updated_at FROM protocols";

    if (!whereClause.empty())
        query << " WHERE " << whereClause;
    if (!orderBy.empty())
        query << " ORDER BY " << orderBy;
    if (!limit.empty())
        query << " " << limit;

    return query.str();
}

std::string ProtocolRepository::buildSelectQueryClientIdAndProtocolId(const std::string& whereClause,
                                                                      const std::string& orderBy,
                                                                      const std::string& limit)
{
    std::stringstream query;
    query << "SELECT "
          << "pf.id, "
          << "p.title, "
          << "pf.protocol_id, "
          << "TO_CHAR(pf.created_at, 'YYYY-MM-DD') as created_at "
          << "FROM protocol_forms pf "
          << "JOIN protocols p ON pf.protocol_id = p.id";

    if (!whereClause.empty())
        query << " WHERE " << whereClause;
    if (!orderBy.empty())
        query << " ORDER BY " << orderBy;
    if (!limit.empty())
        query << " " << limit;

    return query.str();
}

std::string ProtocolRepository::buildSelectQueryClientId(const std::string& whereClause, const std::string& orderBy,
                                                         const std::string& limit)
{
    std::stringstream query;
    query << "SELECT "
          << "pf.id, "
          << "pf.protocol_id, "
          << "p.title, "
          << "TO_CHAR(pf.created_at, 'YYYY-MM-DD') as created_at "
          << "FROM protocol_forms pf "
          << "JOIN protocols p ON pf.protocol_id = p.id";

    if (!whereClause.empty())
        query << " WHERE " << whereClause;
    if (!orderBy.empty())
        query << " ORDER BY " << orderBy;
    if (!limit.empty())
        query << " " << limit;

    return query.str();
}

QMap<QString, QString> ProtocolRepository::parseProtocolForm(const json& j, const std::string &date)
{
    QMap<QString, QString> map;

#ifdef QT_CORE_LIB
    auto makeStr = [](const std::string& s) { return QString::fromStdString(s); };
    auto isEmpty = [](const QString& s) { return s.isEmpty(); };
    auto toNum   = [](size_t v) { return QString::number(static_cast<qlonglong>(v)); };
#else
    auto makeStr = [](const std::string& s) { return s; };
    auto isEmpty = [](const std::string& s) { return s.empty(); };
    auto toNum   = [](size_t v) { return std::to_string(v); };
#endif

    std::function<void(const json&, const QString&)> parse = [&](const json& obj, const QString& prefix)
    {
        for (auto it = obj.begin(); it != obj.end(); ++it) {
            QString currentKey = makeStr(it.key());
            QString fullKey = isEmpty(prefix)
                                  ? currentKey
                                  : prefix + "_" + currentKey;

            if (it->is_object()) {
                // Nested object → rekursiv
                parse(*it, fullKey);
            }
            else if (it->is_array()) {
                // Agar massiv bo‘lsa (masalan, ["a","b"]), u holda indeksni qo‘shamiz
                for (size_t i = 0; i < it->size(); ++i) {
                    parse((*it)[i], fullKey + "_" + toNum(i));
                }
            }
            else {
                // Oddiy qiymatni yozamiz
                if (it->is_string()) {
                    map[fullKey] = makeStr(it->get<std::string>());
                } else {
                    map[fullKey] = makeStr(it->dump());
                }
            }
        }
    };
    map["date"] = makeStr(date);
    parse(j, "");
    return map;
}



QMap<QString, QString> ProtocolRepository::getProtoclFormByClientIdProtocolId(int64_t protocolFormId, int64_t clientId, int64_t doctorId) {
    QMap<QString, QString> protocolForm;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) {
            qWarning() << "❌ Bazaga ulanib bo‘lmadi!";
            return protocolForm;
        }

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params(
            "SELECT pf.protocol_form, TO_CHAR(pf.created_at, 'YYYY-MM-DD') as created_at "
            "FROM protocol_forms pf "
            "JOIN protocols p ON pf.protocol_id = p.id "
            "WHERE pf.id = $1 AND pf.client_id = $2 AND p.doctor_id = $3",
            protocolFormId, clientId, doctorId
        );

        txn.commit();

        if (!result.empty() && !result[0]["protocol_form"].is_null()) {
            std::string jsonb_data = result[0]["protocol_form"].as<std::string>();
            std::string date = result[0]["created_at"].as<std::string>();
            try {
                nlohmann::json j = nlohmann::json::parse(jsonb_data);
                protocolForm = parseProtocolForm(j, date);
            }
            catch (const std::exception& e) {
                qWarning() << "❌ JSON parse xatosi:" << e.what();
            }
        } else {
            qInfo() << "ℹ️ Ma’lumot topilmadi (protocol_form_id =" << protocolFormId << ")";
        }

        return protocolForm;
    }
    catch (const std::exception& e) {
        qWarning() << "❌ getProtoclFormByClientIdProtocolId() xato:" << e.what();
        return protocolForm;
    }
}

void ProtocolRepository::createProtocolForm(int64_t clientId, int64_t protocolId, json protocolForm) {
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return;

        pqxx::work txn(*conn);

        std::string query = R"(
            INSERT INTO protocol_forms (client_id, protocol_id, protocol_form)
            VALUES ($1, $2, $3)
        )";
        std::string jsonString = protocolForm.dump();
        pqxx::result result = txn.exec_params(query, clientId, protocolId, jsonString);

        txn.commit();

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Protocol createda xato " << e.what() << std::endl;
    }
}



std::shared_ptr<Domain::Protocol> ProtocolRepository::getById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;

        pqxx::work txn(*conn);

        std::string  query  = buildSelectQuery("id = $1");
        pqxx::result result = txn.exec_params(query, id);

        txn.commit();

        if (!result.empty())
            return mapRowToProtocol(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Protocol topishda xato (ID: " << id << "): " << e.what() << std::endl;
        return nullptr;
    }
}

Common::ProtocolDashboardResponse ProtocolRepository::getAllByDoctorId(int64_t id)
{
    Common::ProtocolDashboardResponse response;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return response;

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params("SELECT id, title FROM protocols WHERE doctor_id = $1", id);

        txn.commit();

        for (const auto& row : result)
            response.items.push_back(mapRowToProtocolDashboard(row));

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Protocol olishda xato (doctor_id=" << id << "): " << e.what() << std::endl;
    }

    return response;
}

Common::ProtocolFormsResponse ProtocolRepository::getClientId(Common::PaginationRequest request, int64_t clientId)
{
    Common::ProtocolFormsResponse response;
    response.currentPage = request.page;
    response.pageSize    = request.pageSize;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return response;

        pqxx::work txn(*conn);

        std::string countQuery = "SELECT COUNT(*) FROM protocol_forms WHERE client_id = $1";
        pqxx::result countResult = txn.exec_params(countQuery, clientId);
        response.totalCount = countResult[0][0].as<int>();
        response.totalPages = (response.totalCount + request.pageSize - 1) / request.pageSize;

        std::string orderBy = sanitizeOrderBy(request);
        std::string limit = "LIMIT " + std::to_string(request.pageSize) +
                            " OFFSET " + std::to_string(request.getOffset());
        std::string where = "client_id = $1";
        std::string query = buildSelectQueryClientId(where, orderBy, limit);

        pqxx::result result = txn.exec_params(query, clientId);
        txn.commit();

        qDebug() << "Total Count:" << response.totalCount << "Total Pages:" << response.totalPages;

        for (const auto& row : result) {
            response.items.push_back(mapRowToProtocolClientIdAndProtocolId(row));
        }

        response.hasNext     = request.page < response.totalPages;
        response.hasPrevious = request.page > 1;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Protocol olishda xato: " << e.what() << std::endl;
    }

    return response;
}

Common::ProtocolFormsResponse ProtocolRepository::getClientIdAndProtocolId(Common::PaginationRequest request,
                                                                           int64_t clientId, int64_t protocolId, std::string date)
{
    Common::ProtocolFormsResponse response;
    response.currentPage = request.page;
    response.pageSize    = request.pageSize;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return response;

        pqxx::work txn(*conn);

        // COUNT query
        std::string countQuery = "SELECT COUNT(*) FROM protocol_forms WHERE client_id = $1 AND protocol_id = $2";
        pqxx::result countResult;

        if (!date.empty()) {
            countQuery += " AND created_at >= $3::date AND created_at < ($3::date + INTERVAL '1 day')";
            countResult = txn.exec_params(countQuery, clientId, protocolId, date);
        } else {
            countResult = txn.exec_params(countQuery, clientId, protocolId);
        }

        response.totalCount = countResult[0][0].as<int>();
        response.totalPages = (response.totalCount + request.pageSize - 1) / request.pageSize;

        // Asosiy query - pf. prefiksi bilan
        std::string orderBy = sanitizeOrderBy(request);
        std::string limit = "LIMIT " + std::to_string(request.pageSize) +
                            " OFFSET " + std::to_string(request.getOffset());
        std::string where = "pf.client_id = $1 AND pf.protocol_id = $2";

        if (!date.empty()) {
            where += " AND pf.created_at >= $3::date AND pf.created_at < ($3::date + INTERVAL '1 day')";
        }

        std::string query = buildSelectQueryClientIdAndProtocolId(where, orderBy, limit);
        pqxx::result result;

        if (!date.empty()) {
            result = txn.exec_params(query, clientId, protocolId, date);
        } else {
            result = txn.exec_params(query, clientId, protocolId);
        }

        txn.commit();

        for (const auto& row : result) {
            response.items.push_back(mapRowToProtocolClientIdAndProtocolId(row));
        }

        response.hasNext     = request.page < response.totalPages;
        response.hasPrevious = request.page > 1;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Protocol olishda xato: " << e.what() << std::endl;
    }

    return response;
}
bool ProtocolRepository::existsById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return false;

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params("SELECT 1 FROM protocols WHERE id = $1", id);

        txn.commit();

        return !result.empty();

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ID mavjudligini tekshirishda xato: " << e.what() << std::endl;
        return false;
    }
}

}  // namespace Repositories
