#ifndef DOMAIN_PROTOCOL_TEMPLATE_H
#define DOMAIN_PROTOCOL_TEMPLATE_H

#include <string>
#include <vector>
#include <memory>
#include <cstdint>

namespace Domain
{

// Shablon maydoni
class TemplateField
{
public:
    TemplateField() = default;

    // Getters
    int64_t getId() const { return id_; }
    int64_t getTemplateId() const { return templateId_; }
    std::string getFieldName() const { return fieldName_; }
    std::string getFieldLabel() const { return fieldLabel_; }
    std::string getFieldType() const { return fieldType_; }
    int getFieldOrder() const { return fieldOrder_; }
    std::vector<std::string> getDefaultValues() const { return defaultValues_; }
    bool isRequired() const { return isRequired_; }
    int getRowPosition() const { return rowPosition_; }
    int getColumnPosition() const { return columnPosition_; }

    // Setters
    void setId(int64_t id) { id_ = id; }
    void setTemplateId(int64_t templateId) { templateId_ = templateId; }
    void setFieldName(const std::string& name) { fieldName_ = name; }
    void setFieldLabel(const std::string& label) { fieldLabel_ = label; }
    void setFieldType(const std::string& type) { fieldType_ = type; }
    void setFieldOrder(int order) { fieldOrder_ = order; }
    void setDefaultValues(const std::vector<std::string>& values) { defaultValues_ = values; }
    void setIsRequired(bool required) { isRequired_ = required; }
    void setRowPosition(int row) { rowPosition_ = row; }
    void setColumnPosition(int col) { columnPosition_ = col; }

private:
    int64_t id_ = 0;
    int64_t templateId_ = 0;
    std::string fieldName_;
    std::string fieldLabel_;
    std::string fieldType_ = "combobox";  // combobox, text, number
    int fieldOrder_ = 0;
    std::vector<std::string> defaultValues_;
    bool isRequired_ = false;
    int rowPosition_ = 0;
    int columnPosition_ = 0;
};

// Protokol shabloni
class ProtocolTemplate
{
public:
    ProtocolTemplate() = default;

    // Getters
    int64_t getId() const { return id_; }
    int64_t getDoctorId() const { return doctorId_; }
    std::string getTitle() const { return title_; }
    std::string getDescription() const { return description_; }
    std::string getHtmlTemplate() const { return htmlTemplate_; }
    std::string getCreatedAt() const { return createdAt_; }
    std::vector<std::shared_ptr<TemplateField>> getFields() const { return fields_; }

    // Setters
    void setId(int64_t id) { id_ = id; }
    void setDoctorId(int64_t doctorId) { doctorId_ = doctorId; }
    void setTitle(const std::string& title) { title_ = title; }
    void setDescription(const std::string& desc) { description_ = desc; }
    void setHtmlTemplate(const std::string& html) { htmlTemplate_ = html; }
    void setCreatedAt(const std::string& date) { createdAt_ = date; }
    void setFields(const std::vector<std::shared_ptr<TemplateField>>& fields) { fields_ = fields; }
    void addField(std::shared_ptr<TemplateField> field) { fields_.push_back(field); }

    // HTML shablon generatsiyasi
    std::string generateHtmlTemplate() const;

private:
    int64_t id_ = 0;
    int64_t doctorId_ = 0;
    std::string title_;
    std::string description_;
    std::string htmlTemplate_;
    std::string createdAt_;
    std::vector<std::shared_ptr<TemplateField>> fields_;
};

}  // namespace Domain

#endif  // DOMAIN_PROTOCOL_TEMPLATE_H
