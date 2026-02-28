#ifndef USECASE_PROTOCOL_TEMPLATE_H
#define USECASE_PROTOCOL_TEMPLATE_H

#include "../../repository/protocol_template/index.h"
#include "../../domain/protocol_template/index.h"
#include <memory>
#include <vector>

namespace UseCase
{

class ProtocolTemplateUseCase
{
public:
    explicit ProtocolTemplateUseCase(Repositories::ProtocolTemplateRepository* repository);

    // Shablon operatsiyalari
    std::shared_ptr<Domain::ProtocolTemplate> createTemplate(
        int64_t doctorId,
        const std::string& title,
        const std::string& description = ""
    );

    std::shared_ptr<Domain::ProtocolTemplate> getTemplateById(int64_t id);
    std::vector<std::shared_ptr<Domain::ProtocolTemplate>> getTemplatesByDoctorId(int64_t doctorId);

    bool updateTemplate(int64_t id, const std::string& title, const std::string& description);
    bool deleteTemplate(int64_t id);

    // Maydon operatsiyalari
    std::shared_ptr<Domain::TemplateField> addField(
        int64_t templateId,
        const std::string& fieldName,
        const std::string& fieldLabel,
        const std::string& fieldType = "combobox",
        const std::vector<std::string>& defaultValues = {},
        bool isRequired = false,
        int rowPosition = 0,
        int columnPosition = 0
    );

    bool updateField(const Domain::TemplateField& field);
    bool deleteField(int64_t fieldId);
    bool reorderFields(int64_t templateId, const std::vector<int64_t>& fieldIds);

    // HTML shablon generatsiyasi
    std::string generateHtmlForTemplate(int64_t templateId);

    // Shablonni protocols jadvaliga qo'shish
    bool registerAsProtocol(int64_t templateId, int64_t doctorId);

private:
    Repositories::ProtocolTemplateRepository* repository_;
};

}  // namespace UseCase

#endif  // USECASE_PROTOCOL_TEMPLATE_H
