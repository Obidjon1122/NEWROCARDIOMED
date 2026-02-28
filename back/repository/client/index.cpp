#include "index.h"

#include <iostream>
#include <sstream>
#include <unordered_map>
#include <algorithm>

namespace
{
std::string sanitizeOrderBy(const Common::PaginationRequest& request, bool useClientAlias)
{
    const std::unordered_map<std::string, std::string> columns = {

    };

    auto it = columns.find(request.sortBy);
    std::string column = (it != columns.end()) ? it->second : "id";
    if (useClientAlias) {
        column = "c." + column;
    }

    std::string order = request.sortOrder;
    std::transform(order.begin(), order.end(), order.begin(), ::toupper);
    if (order != "DESC") {
        order = "ASC";
    }
    return column + " " + order;
}
}

namespace Repositories
{

ClientRepository::ClientRepository(Infrastructure::Storage::DatabaseConnection* dbConnection)
    : dbConnection_(dbConnection)
{
}

std::shared_ptr<Domain::Client> ClientRepository::mapRowToClient(const pqxx::row& row)
{
    auto client = std::make_shared<Domain::Client>();
    client->setId(row["id"].as<int64_t>());
    client->setFirstName(row["first_name"].as<std::string>());
    client->setLastName(row["last_name"].as<std::string>());
    client->setGender(row["gender"].as<std::string>());
    client->setPhone(row["phone"].as<std::string>());
    client->setBirthDate(row["birth_date"].as<std::string>());
    client->setRegion(row["region"].as<std::string>());
    client->setCreatedAt(row["created_at"].as<std::string>());
    client->setUpdatedAt(row["updated_at"].as<std::string>());
    return client;
}

std::string ClientRepository::buildSelectQuery(const std::string& whereClause, const std::string& orderBy,
                                               const std::string& limit)
{
    std::stringstream query;
    query << "SELECT id, first_name, last_name, gender, phone, "
             "birth_date, region, "
          << "created_at, "
          << "updated_at "
          << "FROM clients";

    if (!whereClause.empty())
        query << " WHERE " << whereClause;
    if (!orderBy.empty())
        query << " ORDER BY " << orderBy;
    if (!limit.empty())
        query << " " << limit;

    return query.str();
}

std::string ClientRepository::buildSelectQueryProtocol(const std::string& whereClause, const std::string& orderBy,
                                                       const std::string& limit)
{
    std::stringstream query;
    query << "SELECT "
          << "c.id, "
          << "c.first_name, "
          << "c.last_name, "
          << "c.gender, "
          << "c.phone, "
          << "birth_date, "
          << "c.region, "
          << "TO_CHAR(c.created_at, 'YYYY-MM-DD') as created_at, "
          << "TO_CHAR(c.updated_at, 'YYYY-MM-DD') as updated_at, "
          << "COUNT(*) OVER () AS total_clients "
          << "FROM protocol_forms pf "
          << "JOIN protocols p ON pf.protocol_id = p.id "
          << "JOIN clients c ON pf.client_id = c.id ";

    if (!whereClause.empty())
        query << " WHERE " << whereClause;

    query << " GROUP BY c.id, c.first_name, c.last_name, "
          << "c.gender, c.phone, c.birth_date, c.region, c.created_at, c.updated_at";

    if (!orderBy.empty())
        query << " ORDER BY " << orderBy;
    if (!limit.empty())
        query << " " << limit;

    return query.str();
}

std::shared_ptr<Domain::Client> ClientRepository::create(const Domain::Client& client)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;
        pqxx::work txn(*conn);

        std::string query = R"(
            INSERT INTO clients (first_name, last_name, gender, phone, birth_date, region)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, first_name, last_name, gender, phone, birth_date, region,
                      TO_CHAR(created_at, 'YYYY-MM-DD') as created_at, 
                      TO_CHAR(updated_at, 'YYYY-MM-DD') as updated_at
        )";

        pqxx::result result =
                txn.exec_params(query, client.getFirstName(), client.getLastName(),
                                client.getGender(), client.getPhone(), client.getBirthDate(), client.getRegion());

        txn.commit();

        if (!result.empty())
            return mapRowToClient(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Client yaratishda xato: " << e.what() << std::endl;
        return nullptr;
    }
}

std::shared_ptr<Domain::Client> ClientRepository::getById(int64_t id)
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
            return mapRowToClient(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Client topishda xato (ID: " << id << "): " << e.what() << std::endl;
        return nullptr;
    }
}

std::shared_ptr<Domain::Client> ClientRepository::getByPhone(const std::string& phone)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;

        pqxx::work txn(*conn);

        std::string  query  = buildSelectQuery("phone = $1");
        pqxx::result result = txn.exec_params(query, phone);

        txn.commit();

        if (!result.empty())
            return mapRowToClient(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Client topishda xato (Phone: " << phone << "): " << e.what() << std::endl;
        return nullptr;
    }
}

std::shared_ptr<Domain::Client> ClientRepository::update(std::shared_ptr<Domain::Client> client)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;

        std::string query = R"(
            UPDATE clients
            SET first_name = $1, last_name = $2, gender = $3,
                phone = $4, birth_date = $5, region = $6, updated_at = now()
            WHERE id = $7
            RETURNING id, first_name, last_name, gender, phone, birth_date, region,
                      TO_CHAR(created_at, 'YYYY-MM-DD') as created_at, 
                      TO_CHAR(updated_at, 'YYYY-MM-DD') as updated_at
        )";

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params(query, client->getFirstName(), client->getLastName(),
                                              client->getGender(), client->getPhone(),
                                              client->getBirthDate(), client->getRegion(), client->getId());

        txn.commit();

        if (!result.empty())
            return mapRowToClient(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Client yangilashda xato: " << e.what() << std::endl;
        return nullptr;
    }
}

bool ClientRepository::deleteById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return false;

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params("DELETE FROM clients WHERE id = $1", id);

        txn.commit();

        return result.affected_rows() > 0;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Client o'chirishda xato: " << e.what() << std::endl;
        return false;
    }
}

Common::PaginationResponse<Domain::Client> ClientRepository::getAllClientByProtocolId(
        const Common::PaginationRequest& request, int64_t id, const std::string& text)
{
    Common::PaginationResponse<Domain::Client> response;
    response.currentPage = request.page;
    response.pageSize    = request.pageSize;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) {
            std::cerr << "[REPO] DB ulanmagan.\n";
            return response;
        }

        pqxx::work txn(*conn);

        std::string orderBy = sanitizeOrderBy(request, true);
        std::string limit =
                "LIMIT " + std::to_string(request.pageSize) + " OFFSET " + std::to_string(request.getOffset());

        std::string where     = "pf.protocol_id = $1";
        bool        hasSearch = !text.empty();

        if (hasSearch) {
            where += " AND (LOWER(c.first_name) LIKE LOWER($2) OR "
                     "LOWER(c.last_name) LIKE LOWER($2) OR "
                     "LOWER(CONCAT(c.first_name, ' ', c.last_name)) LIKE LOWER($2) OR "
                     "c.phone LIKE $2 OR "
                     "c.birth_date LIKE $2)";
        }

        std::string query = buildSelectQueryProtocol(where, orderBy, limit);

        pqxx::result result;
        if (hasSearch) {
            std::string likeText = text + "%";
            result               = txn.exec_params(query, id, likeText);
        }
        else {
            result = txn.exec_params(query, id);
        }

        txn.commit();

        if (!result.empty()) {
            response.totalCount = result[0]["total_clients"].as<int>();
            response.totalPages = (response.totalCount + request.pageSize - 1) / request.pageSize;

            for (const auto& row : result) {
                response.items.push_back(mapRowToClient(row));
            }
        }

        response.hasNext     = request.page < response.totalPages;
        response.hasPrevious = request.page > 1;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Client olishda xato: " << e.what() << std::endl;
    }

    return response;
}

Common::PaginationResponse<Domain::Client> ClientRepository::getAll(const Common::PaginationRequest& request,
                                                                    const std::string&               text)
{
    Common::PaginationResponse<Domain::Client> response;
    response.currentPage = request.page;
    response.pageSize    = request.pageSize;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return response;

        pqxx::work txn(*conn);

        // Count query with search
        bool         hasSearch = !text.empty();
        pqxx::result countResult;

        if (hasSearch) {
            std::string countQuery =
                    "SELECT COUNT(*) FROM clients "
                    "WHERE LOWER(first_name) LIKE LOWER($1) OR "
                    "LOWER(last_name) LIKE LOWER($1) OR "
                    "LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER($1) OR "
                    "phone LIKE $1 OR "
                    "CAST(birth_date AS TEXT) LIKE $1";

            std::string likeText = text + "%";
            countResult          = txn.exec_params(countQuery, likeText);
        }
        else {
            countResult = txn.exec("SELECT COUNT(*) FROM clients");
        }

        response.totalCount = countResult[0][0].as<int>();
        response.totalPages = (response.totalCount + request.pageSize - 1) / request.pageSize;

        // Main query
        std::string orderBy = sanitizeOrderBy(request, false);
        std::string limit =
                "LIMIT " + std::to_string(request.pageSize) + " OFFSET " + std::to_string(request.getOffset());
        std::string where = "";

        if (hasSearch) {
            where = "LOWER(first_name) LIKE LOWER($1) OR "
                    "LOWER(last_name) LIKE LOWER($1) OR "
                    "LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER($1) OR "
                    "phone LIKE $1 OR "
                    "CAST(birth_date AS TEXT) LIKE $1";
        }

        std::string query = buildSelectQuery(where, orderBy, limit);

        pqxx::result result;
        if (hasSearch) {
            std::string likeText = text + "%";
            result               = txn.exec_params(query, likeText);
        }
        else {
            result = txn.exec(query);
        }

        txn.commit();

        for (const auto& row : result)
            response.items.push_back(mapRowToClient(row));

        response.hasNext     = request.page < response.totalPages;
        response.hasPrevious = request.page > 1;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Client olishda xato: " << e.what() << std::endl;
    }

    return response;
}

int ClientRepository::getTotalCount()
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return 0;

        pqxx::work   txn(*conn);
        pqxx::result result = txn.exec("SELECT COUNT(*) FROM clients");
        txn.commit();

        return result[0][0].as<int>();

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Total count olishda xato: " << e.what() << std::endl;
        return 0;
    }
}

bool ClientRepository::existsById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return false;

        pqxx::work   txn(*conn);
        pqxx::result result = txn.exec_params("SELECT 1 FROM clients WHERE id = $1", id);
        txn.commit();

        return !result.empty();

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ID mavjudligini tekshirishda xato: " << e.what() << std::endl;
        return false;
    }
}

}  // namespace Repositories
