#include "index.h"
#include <iostream>

namespace UseCase
{

ProtocolTemplateUseCase::ProtocolTemplateUseCase(Repositories::ProtocolTemplateRepository* repository)
    : repository_(repository)
{
}

std::shared_ptr<Domain::ProtocolTemplate> ProtocolTemplateUseCase::createTemplate(
    int64_t doctorId,
    const std::string& title,
    const std::string& description)
{
    Domain::ProtocolTemplate templ;
    templ.setDoctorId(doctorId);
    templ.setTitle(title);
    templ.setDescription(description);

    return repository_->create(templ);
}

std::shared_ptr<Domain::ProtocolTemplate> ProtocolTemplateUseCase::getTemplateById(int64_t id)
{
    return repository_->getById(id);
}

std::vector<std::shared_ptr<Domain::ProtocolTemplate>> ProtocolTemplateUseCase::getTemplatesByDoctorId(int64_t doctorId)
{
    return repository_->getByDoctorId(doctorId);
}

bool ProtocolTemplateUseCase::updateTemplate(int64_t id, const std::string& title, const std::string& description)
{
    auto templ = repository_->getById(id);
    if (!templ) return false;

    templ->setTitle(title);
    templ->setDescription(description);

    // HTML shablonini qayta generatsiya qilish
    templ->setHtmlTemplate(templ->generateHtmlTemplate());

    return repository_->update(*templ);
}

bool ProtocolTemplateUseCase::deleteTemplate(int64_t id)
{
    // Avval barcha maydonlarni o'chirish
    repository_->deleteFieldsByTemplateId(id);
    return repository_->deleteById(id);
}

std::shared_ptr<Domain::TemplateField> ProtocolTemplateUseCase::addField(
    int64_t templateId,
    const std::string& fieldName,
    const std::string& fieldLabel,
    const std::string& fieldType,
    const std::vector<std::string>& defaultValues,
    bool isRequired,
    int rowPosition,
    int columnPosition)
{
    // Mavjud maydonlar sonini olish (tartib uchun)
    auto existingFields = repository_->getFieldsByTemplateId(templateId);
    int fieldOrder = static_cast<int>(existingFields.size());

    Domain::TemplateField field;
    field.setTemplateId(templateId);
    field.setFieldName(fieldName);
    field.setFieldLabel(fieldLabel);
    field.setFieldType(fieldType);
    field.setFieldOrder(fieldOrder);
    field.setDefaultValues(defaultValues);
    field.setIsRequired(isRequired);
    field.setRowPosition(rowPosition);
    field.setColumnPosition(columnPosition);

    auto createdField = repository_->createField(field);

    // HTML shablonini qayta generatsiya qilish
    if (createdField) {
        auto templ = repository_->getById(templateId);
        if (templ) {
            templ->setHtmlTemplate(templ->generateHtmlTemplate());
            repository_->update(*templ);
        }
    }

    return createdField;
}

bool ProtocolTemplateUseCase::updateField(const Domain::TemplateField& field)
{
    bool result = repository_->updateField(field);

    // HTML shablonini qayta generatsiya qilish
    if (result) {
        auto templ = repository_->getById(field.getTemplateId());
        if (templ) {
            templ->setHtmlTemplate(templ->generateHtmlTemplate());
            repository_->update(*templ);
        }
    }

    return result;
}

bool ProtocolTemplateUseCase::deleteField(int64_t fieldId)
{
    // Avval field ma'lumotlarini olish
    // (templateId ni bilish uchun)
    // Bu yerda oddiy delete qilamiz
    return repository_->deleteField(fieldId);
}

bool ProtocolTemplateUseCase::reorderFields(int64_t templateId, const std::vector<int64_t>& fieldIds)
{
    auto fields = repository_->getFieldsByTemplateId(templateId);

    for (size_t i = 0; i < fieldIds.size(); ++i) {
        for (auto& field : fields) {
            if (field->getId() == fieldIds[i]) {
                field->setFieldOrder(static_cast<int>(i));
                repository_->updateField(*field);
                break;
            }
        }
    }

    // HTML shablonini qayta generatsiya qilish
    auto templ = repository_->getById(templateId);
    if (templ) {
        templ->setHtmlTemplate(templ->generateHtmlTemplate());
        repository_->update(*templ);
    }

    return true;
}

std::string ProtocolTemplateUseCase::generateHtmlForTemplate(int64_t templateId)
{
    auto templ = repository_->getById(templateId);
    if (!templ) return "";

    return templ->generateHtmlTemplate();
}

bool ProtocolTemplateUseCase::registerAsProtocol(int64_t templateId, int64_t doctorId)
{
    // Bu funksiya shablonni protocols jadvaliga qo'shadi
    // Hozircha stub - keyinroq implement qilinadi
    std::cout << "[UseCase] registerAsProtocol: templateId=" << templateId
              << ", doctorId=" << doctorId << std::endl;
    return true;
}

}  // namespace UseCase
