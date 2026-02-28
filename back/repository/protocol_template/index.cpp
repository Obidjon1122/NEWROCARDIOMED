#include "index.h"
#include <iostream>
#include <sstream>
#include <regex>

namespace Repositories
{

ProtocolTemplateRepository::ProtocolTemplateRepository(Infrastructure::Storage::DatabaseConnection* dbConnection)
    : dbConnection_(dbConnection)
{
}

std::vector<std::string> ProtocolTemplateRepository::parseArrayField(const std::string& arrayStr)
{
    std::vector<std::string> result;
    if (arrayStr.empty() || arrayStr == "{}") {
        return result;
    }

    // PostgreSQL array formatini parse qilish: {value1,value2,value3}
    std::string content = arrayStr.substr(1, arrayStr.length() - 2);  // {} ni olib tashlash
    std::stringstream ss(content);
    std::string item;

    while (std::getline(ss, item, ',')) {
        // Qo'shtirnoqlarni olib tashlash
        if (!item.empty() && item.front() == '"') {
            item = item.substr(1);
        }
        if (!item.empty() && item.back() == '"') {
            item = item.substr(0, item.length() - 1);
        }
        if (!item.empty()) {
            result.push_back(item);
        }
    }
    return result;
}

std::string ProtocolTemplateRepository::arrayToPostgres(const std::vector<std::string>& arr)
{
    if (arr.empty()) {
        return "{}";
    }

    std::stringstream ss;
    ss << "{";
    for (size_t i = 0; i < arr.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "\"" << arr[i] << "\"";
    }
    ss << "}";
    return ss.str();
}

std::shared_ptr<Domain::ProtocolTemplate> ProtocolTemplateRepository::mapRowToTemplate(const pqxx::row& row)
{
    auto templ = std::make_shared<Domain::ProtocolTemplate>();
    templ->setId(row["id"].as<int64_t>());
    templ->setDoctorId(row["doctor_id"].as<int64_t>());
    templ->setTitle(row["title"].as<std::string>());

    if (!row["description"].is_null()) {
        templ->setDescription(row["description"].as<std::string>());
    }
    if (!row["html_template"].is_null()) {
        templ->setHtmlTemplate(row["html_template"].as<std::string>());
    }
    if (!row["created_at"].is_null()) {
        templ->setCreatedAt(row["created_at"].as<std::string>());
    }

    return templ;
}

std::shared_ptr<Domain::TemplateField> ProtocolTemplateRepository::mapRowToField(const pqxx::row& row)
{
    auto field = std::make_shared<Domain::TemplateField>();
    field->setId(row["id"].as<int64_t>());
    field->setTemplateId(row["template_id"].as<int64_t>());
    field->setFieldName(row["field_name"].as<std::string>());
    field->setFieldLabel(row["field_label"].as<std::string>());

    if (!row["field_type"].is_null()) {
        field->setFieldType(row["field_type"].as<std::string>());
    }
    if (!row["field_order"].is_null()) {
        field->setFieldOrder(row["field_order"].as<int>());
    }
    if (!row["default_values"].is_null()) {
        field->setDefaultValues(parseArrayField(row["default_values"].as<std::string>()));
    }
    if (!row["is_required"].is_null()) {
        field->setIsRequired(row["is_required"].as<bool>());
    }
    if (!row["row_position"].is_null()) {
        field->setRowPosition(row["row_position"].as<int>());
    }
    if (!row["column_position"].is_null()) {
        field->setColumnPosition(row["column_position"].as<int>());
    }

    return field;
}

std::shared_ptr<Domain::ProtocolTemplate> ProtocolTemplateRepository::create(const Domain::ProtocolTemplate& templ)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return nullptr;

        pqxx::work txn(*conn);

        std::string query = R"(
            INSERT INTO protocol_templates (doctor_id, title, description, html_template)
            VALUES ($1, $2, $3, $4)
            RETURNING id, doctor_id, title, description, html_template, created_at
        )";

        pqxx::result result = txn.exec_params(query,
            templ.getDoctorId(),
            templ.getTitle(),
            templ.getDescription(),
            templ.getHtmlTemplate()
        );

        txn.commit();

        if (!result.empty()) {
            return mapRowToTemplate(result[0]);
        }
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ProtocolTemplate create xato: " << e.what() << std::endl;
        return nullptr;
    }
}

std::shared_ptr<Domain::ProtocolTemplate> ProtocolTemplateRepository::getById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return nullptr;

        pqxx::work txn(*conn);

        std::string query = R"(
            SELECT id, doctor_id, title, description, html_template, created_at
            FROM protocol_templates WHERE id = $1
        )";

        pqxx::result result = txn.exec_params(query, id);
        txn.commit();

        if (!result.empty()) {
            auto templ = mapRowToTemplate(result[0]);
            templ->setFields(getFieldsByTemplateId(id));
            return templ;
        }
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ProtocolTemplate getById xato: " << e.what() << std::endl;
        return nullptr;
    }
}

std::vector<std::shared_ptr<Domain::ProtocolTemplate>> ProtocolTemplateRepository::getByDoctorId(int64_t doctorId)
{
    std::vector<std::shared_ptr<Domain::ProtocolTemplate>> templates;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return templates;

        pqxx::work txn(*conn);

        std::string query = R"(
            SELECT id, doctor_id, title, description, html_template, created_at
            FROM protocol_templates WHERE doctor_id = $1
            ORDER BY created_at DESC
        )";

        pqxx::result result = txn.exec_params(query, doctorId);
        txn.commit();

        for (const auto& row : result) {
            auto templ = mapRowToTemplate(row);
            templ->setFields(getFieldsByTemplateId(templ->getId()));
            templates.push_back(templ);
        }

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ProtocolTemplate getByDoctorId xato: " << e.what() << std::endl;
    }

    return templates;
}

bool ProtocolTemplateRepository::update(const Domain::ProtocolTemplate& templ)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return false;

        pqxx::work txn(*conn);

        std::string query = R"(
            UPDATE protocol_templates
            SET title = $2, description = $3, html_template = $4
            WHERE id = $1
        )";

        txn.exec_params(query,
            templ.getId(),
            templ.getTitle(),
            templ.getDescription(),
            templ.getHtmlTemplate()
        );

        txn.commit();
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ProtocolTemplate update xato: " << e.what() << std::endl;
        return false;
    }
}

bool ProtocolTemplateRepository::deleteById(int64_t id)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return false;

        pqxx::work txn(*conn);
        txn.exec_params("DELETE FROM protocol_templates WHERE id = $1", id);
        txn.commit();
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] ProtocolTemplate delete xato: " << e.what() << std::endl;
        return false;
    }
}

// Field operatsiyalari
std::shared_ptr<Domain::TemplateField> ProtocolTemplateRepository::createField(const Domain::TemplateField& field)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return nullptr;

        pqxx::work txn(*conn);

        std::string query = R"(
            INSERT INTO template_fields
            (template_id, field_name, field_label, field_type, field_order, default_values, is_required, row_position, column_position)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, template_id, field_name, field_label, field_type, field_order, default_values, is_required, row_position, column_position
        )";

        pqxx::result result = txn.exec_params(query,
            field.getTemplateId(),
            field.getFieldName(),
            field.getFieldLabel(),
            field.getFieldType(),
            field.getFieldOrder(),
            arrayToPostgres(field.getDefaultValues()),
            field.isRequired(),
            field.getRowPosition(),
            field.getColumnPosition()
        );

        txn.commit();

        if (!result.empty()) {
            return mapRowToField(result[0]);
        }
        return nullptr;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] TemplateField create xato: " << e.what() << std::endl;
        return nullptr;
    }
}

std::vector<std::shared_ptr<Domain::TemplateField>> ProtocolTemplateRepository::getFieldsByTemplateId(int64_t templateId)
{
    std::vector<std::shared_ptr<Domain::TemplateField>> fields;

    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return fields;

        pqxx::work txn(*conn);

        std::string query = R"(
            SELECT id, template_id, field_name, field_label, field_type, field_order,
                   default_values, is_required, row_position, column_position
            FROM template_fields WHERE template_id = $1
            ORDER BY field_order, row_position, column_position
        )";

        pqxx::result result = txn.exec_params(query, templateId);
        txn.commit();

        for (const auto& row : result) {
            fields.push_back(mapRowToField(row));
        }

    } catch (const std::exception& e) {
        std::cerr << "[REPO] TemplateField getByTemplateId xato: " << e.what() << std::endl;
    }

    return fields;
}

bool ProtocolTemplateRepository::updateField(const Domain::TemplateField& field)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return false;

        pqxx::work txn(*conn);

        std::string query = R"(
            UPDATE template_fields
            SET field_name = $2, field_label = $3, field_type = $4, field_order = $5,
                default_values = $6, is_required = $7, row_position = $8, column_position = $9
            WHERE id = $1
        )";

        txn.exec_params(query,
            field.getId(),
            field.getFieldName(),
            field.getFieldLabel(),
            field.getFieldType(),
            field.getFieldOrder(),
            arrayToPostgres(field.getDefaultValues()),
            field.isRequired(),
            field.getRowPosition(),
            field.getColumnPosition()
        );

        txn.commit();
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] TemplateField update xato: " << e.what() << std::endl;
        return false;
    }
}

bool ProtocolTemplateRepository::deleteField(int64_t fieldId)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return false;

        pqxx::work txn(*conn);
        txn.exec_params("DELETE FROM template_fields WHERE id = $1", fieldId);
        txn.commit();
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] TemplateField delete xato: " << e.what() << std::endl;
        return false;
    }
}

bool ProtocolTemplateRepository::deleteFieldsByTemplateId(int64_t templateId)
{
    try {
        pqxx::connection* conn = dbConnection_->getConnection();
        if (!conn || !conn->is_open()) return false;

        pqxx::work txn(*conn);
        txn.exec_params("DELETE FROM template_fields WHERE template_id = $1", templateId);
        txn.commit();
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[REPO] TemplateFields deleteByTemplateId xato: " << e.what() << std::endl;
        return false;
    }
}

}  // namespace Repositories
