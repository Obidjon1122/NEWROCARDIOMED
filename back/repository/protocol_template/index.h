#ifndef REPOSITORY_PROTOCOL_TEMPLATE_H
#define REPOSITORY_PROTOCOL_TEMPLATE_H

#include "../../domain/protocol_template/index.h"
#include "../../infrastructure/storage/index.h"
#include "../../domain/common/index.h"
#include <memory>
#include <vector>

namespace Repositories
{

class ProtocolTemplateRepository
{
public:
    explicit ProtocolTemplateRepository(Infrastructure::Storage::DatabaseConnection* dbConnection);

    // CRUD operatsiyalari
    std::shared_ptr<Domain::ProtocolTemplate> create(const Domain::ProtocolTemplate& templ);
    std::shared_ptr<Domain::ProtocolTemplate> getById(int64_t id);
    std::vector<std::shared_ptr<Domain::ProtocolTemplate>> getByDoctorId(int64_t doctorId);
    bool update(const Domain::ProtocolTemplate& templ);
    bool deleteById(int64_t id);

    // Maydonlar bilan ishlash
    std::shared_ptr<Domain::TemplateField> createField(const Domain::TemplateField& field);
    std::vector<std::shared_ptr<Domain::TemplateField>> getFieldsByTemplateId(int64_t templateId);
    bool updateField(const Domain::TemplateField& field);
    bool deleteField(int64_t fieldId);
    bool deleteFieldsByTemplateId(int64_t templateId);

private:
    Infrastructure::Storage::DatabaseConnection* dbConnection_;

    std::shared_ptr<Domain::ProtocolTemplate> mapRowToTemplate(const pqxx::row& row);
    std::shared_ptr<Domain::TemplateField> mapRowToField(const pqxx::row& row);
    std::vector<std::string> parseArrayField(const std::string& arrayStr);
    std::string arrayToPostgres(const std::vector<std::string>& arr);
};

}  // namespace Repositories

#endif  // REPOSITORY_PROTOCOL_TEMPLATE_H
