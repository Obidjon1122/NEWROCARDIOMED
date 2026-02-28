#include "index.h"

#include <iostream>
#include <sstream>
#include <unordered_set>
#include <algorithm>

namespace
{
std::string sanitizeOrderBy(const Common::PaginationRequest& request)
{
    static const std::unordered_set<std::string> allowed = {
        "id", "first_name", "last_name", "patronymic", "gender", "phone", "role", "created_at", "updated_at"
    };

    std::string sortBy = request.sortBy;
    if (!allowed.count(sortBy)) {
        sortBy = "id";
    }

    std::string order = request.sortOrder;
    std::transform(order.begin(), order.end(), order.begin(), ::toupper);
    if (order != "DESC") {
        order = "ASC";
    }
    return sortBy + " " + order;
}
}

namespace Repositories
{

UserRepository::UserRepository(Infrastructure::Storage::DatabaseConnection* dbConnection) : dbConnection_(dbConnection)
{
}

std::shared_ptr<Domain::User> UserRepository::mapRowToUser(const pqxx::row& row)
{
    auto user = std::make_shared<Domain::User>();
    user->setId(row["id"].as<int64_t>());
    user->setFirstName(row["first_name"].as<std::string>());
    user->setLastName(row["last_name"].as<std::string>());
    user->setPatronymicName(row["patronymic"].as<std::string>());
    user->setGender(row["gender"].as<std::string>());
    user->setPassword(row["password"].as<std::string>());
    user->setPhone(row["phone"].as<std::string>());
    user->setRole(row["role"].as<std::string>());
    user->setCreatedAt(row["created_at"].as<std::string>());
    user->setUpdatedAt(row["updated_at"].as<std::string>());
    return user;
}

std::string UserRepository::buildSelectQuery(std::stringstream& query, const std::string& whereClause,
                                             const std::string& orderBy, const std::string& limit)
{
    // std::stringstream query;
    // query << "SELECT id, first_name, last_name, patronymic, gender, password, phone, role, "
    //       << "created_at, updated_at FROM users";

    if (!whereClause.empty())
        query << " WHERE " << whereClause;
    if (!orderBy.empty())
        query << " ORDER BY " << orderBy;
    if (!limit.empty())
        query << " " << limit;

    return query.str();
}

std::shared_ptr<Domain::User> UserRepository::create(const Domain::User& user)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;

        pqxx::work txn(*conn);

        std::string query = R"(
            INSERT INTO users (first_name, last_name, patronymic, gender, password, phone, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, first_name, last_name, patronymic, gender, password, phone, role, created_at, updated_at
        )";

        pqxx::result result = txn.exec_params(query, user.getFirstName(), user.getLastName(), user.getPatronymicName(),
                                              user.getGender(), user.getPassword(), user.getPhone(), user.getRole());

        txn.commit();

        if (!result.empty())
            return mapRowToUser(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] User yaratishda xato: " << e.what() << std::endl;
        return nullptr;
    }
}

std::shared_ptr<Domain::User> UserRepository::getById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;

        std::stringstream query;
        query << "SELECT id, first_name, last_name, patronymic, gender, password, phone, role, "
              << "created_at, updated_at FROM users";
        pqxx::work txn(*conn);

        std::string  queryResult = buildSelectQuery(query, "id = $1");
        pqxx::result result      = txn.exec_params(queryResult, id);

        txn.commit();

        if (!result.empty())
            return mapRowToUser(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] User topishda xato (ID: " << id << "): " << e.what() << std::endl;
        return nullptr;
    }
}

std::shared_ptr<Domain::User> UserRepository::getByPhone(const std::string& phone)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;

        std::stringstream query;
        query << "SELECT id, first_name, last_name, patronymic, gender, password, phone, role, "
              << "created_at, updated_at FROM users";

        pqxx::work txn(*conn);

        std::string  queryResult = buildSelectQuery(query, "phone = $1");
        pqxx::result result      = txn.exec_params(queryResult, phone);

        txn.commit();

        if (!result.empty())
            return mapRowToUser(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] User topishda xato (Phone: " << phone << "): " << e.what() << std::endl;
        return nullptr;
    }
}

Common::LoginResponse UserRepository::getLoginByPhone(const std::string& phone)
{
    Common::LoginResponse response;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) {
            response.error        = true;
            response.errorMessage = "Database connection error";
            return response;
        }

        std::stringstream query;
        query << "SELECT id, first_name, last_name, patronymic, gender, password, phone, role, "
              << "created_at, updated_at FROM users";

        pqxx::work   txn(*conn);
        std::string  queryResult = buildSelectQuery(query, "phone = $1");
        pqxx::result result      = txn.exec_params(queryResult, phone);
        txn.commit();

        if (!result.empty()) {
            response.user = mapRowToUser(result[0]);
            return response;
        }

        response.error = true;
        return response;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] User topishda xato (Phone: " << phone << "): " << e.what() << std::endl;
        response.error        = true;
        response.errorMessage = e.what();
        return response;
    }
}

std::shared_ptr<Domain::User> UserRepository::update(const Domain::User& user)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return nullptr;

        std::string query = R"(
            UPDATE users 
            SET first_name = $1, last_name = $2, patronymic = $3, gender = $4, password = $5, phone = $6, role = $7, updated_at = now()
            WHERE id = $8
            RETURNING id, first_name, last_name, patronymic, gender, password, phone, role, created_at, updated_at
        )";

        pqxx::work txn(*conn);

        pqxx::result result =
                txn.exec_params(query, user.getFirstName(), user.getLastName(), user.getPatronymicName(),
                                user.getGender(), user.getPassword(), user.getPhone(), user.getRole(), user.getId());

        txn.commit();

        if (!result.empty())
            return mapRowToUser(result[0]);
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] User yangilashda xato: " << e.what() << std::endl;
        return nullptr;
    }
}

bool UserRepository::deleteById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return false;

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params("DELETE FROM users WHERE id = $1", id);

        txn.commit();

        return result.affected_rows() > 0;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] User o'chirishda xato: " << e.what() << std::endl;
        return false;
    }
}

Common::PaginationResponse<Domain::User> UserRepository::getAll(const Common::PaginationRequest& request)
{
    Common::PaginationResponse<Domain::User> response;
    response.currentPage = request.page;
    response.pageSize    = request.pageSize;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return response;

        pqxx::work txn(*conn);

        pqxx::result countResult = txn.exec("SELECT COUNT(*) FROM users");

        response.totalCount = countResult[0][0].as<int>();
        response.totalPages = (response.totalCount + request.pageSize - 1) / request.pageSize;

        std::string orderBy = sanitizeOrderBy(request);
        std::string limit =
                "LIMIT " + std::to_string(request.pageSize) + " OFFSET " + std::to_string(request.getOffset());
        std::stringstream query;
        query << "SELECT id, first_name, last_name, patronymic, gender, password, phone, role, "
              << "created_at, updated_at FROM users";
        std::string queryResult = buildSelectQuery(query, "", orderBy, limit);

        pqxx::result result = txn.exec(queryResult);

        txn.commit();

        for (const auto& row : result)
            response.items.push_back(mapRowToUser(row));

        response.hasNext     = request.page < response.totalPages;
        response.hasPrevious = request.page > 1;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Users olishda xato: " << e.what() << std::endl;
    }

    return response;
}

std::vector<std::shared_ptr<Domain::User>> UserRepository::getByRole(const std::string& role)
{
    std::vector<std::shared_ptr<Domain::User>> users;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return users;

        std::stringstream query;
        query << "SELECT id, first_name, last_name, patronymic, gender, password, phone, role, "
              << "created_at, updated_at FROM users";

        std::string queryResult = buildSelectQuery(query, "role = $1", "id ASC");

        pqxx::work   txn(*conn);
        pqxx::result result = txn.exec_params(queryResult, role);

        txn.commit();

        for (const auto& row : result)
            users.push_back(mapRowToUser(row));

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Role bo'yicha users olishda xato: " << e.what() << std::endl;
    }

    return users;
}

int UserRepository::getTotalCount()
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return 0;

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec("SELECT COUNT(*) FROM users");

        txn.commit();
        return result[0][0].as<int>();

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Total count olishda xato: " << e.what() << std::endl;
        return 0;
    }
}

bool UserRepository::existsById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return false;

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params("SELECT 1 FROM users WHERE id = $1", id);

        txn.commit();

        return !result.empty();

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ID mavjudligini tekshirishda xato: " << e.what() << std::endl;
        return false;
    }
}

bool UserRepository::existsByPhone(const std::string& phone)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open())
            return false;

        pqxx::work txn(*conn);

        pqxx::result result = txn.exec_params("SELECT 1 FROM users WHERE phone = $1", phone);

        txn.commit();

        return !result.empty();

    } catch (const std::exception& e) {
        std::cerr << "[REPO] Phone mavjudligini tekshirishda xato: " << e.what() << std::endl;
        return false;
    }
}

}  // namespace Repositories
