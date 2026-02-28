#include "templatebuilder.h"
#include "../../allpages.h"
#include <QWebEngineView>
#include <QScrollArea>

TemplateBuilder::TemplateBuilder(QWidget* parent, AllPages* allPages, int64_t templateId)
    : QDialog(parent)
    , allPages_(allPages)
    , templateId_(templateId)
    , currentFieldIndex_(-1)
{
    if (allPages_) {
        templateUseCase_ = allPages_->app_.getProtocolTemplateUseCase();
    }

    setWindowTitle(templateId_ > 0 ? "Shablonni tahrirlash" : "Yangi shablon yaratish");
    setMinimumSize(700, 500);
    resize(850, 650);
    setWindowFlags(Qt::Dialog | Qt::WindowCloseButtonHint);

    setupUI();
    setupStyles();

    if (templateId_ > 0) {
        loadTemplate();
    }
}

TemplateBuilder::~TemplateBuilder()
{
}

void TemplateBuilder::setupUI()
{
    QVBoxLayout* dialogLayout = new QVBoxLayout(this);
    dialogLayout->setSpacing(0);
    dialogLayout->setContentsMargins(0, 0, 0, 0);

    // Scroll area yaratish
    QScrollArea* scrollArea = new QScrollArea();
    scrollArea->setWidgetResizable(true);
    scrollArea->setFrameShape(QFrame::NoFrame);
    scrollArea->setStyleSheet(R"(
        QScrollArea { background-color: #FAFAFA; border: none; }
        QScrollBar:vertical { background: #F0F0F0; width: 8px; border-radius: 4px; }
        QScrollBar::handle:vertical { background: #69DFD9; min-height: 30px; border-radius: 4px; }
    )");

    QWidget* scrollContent = new QWidget();
    QVBoxLayout* mainLayout = new QVBoxLayout(scrollContent);
    mainLayout->setSpacing(12);
    mainLayout->setContentsMargins(16, 16, 16, 16);

    // Template info section
    QGroupBox* templateInfoGroup = new QGroupBox("Shablon ma'lumotlari");
    QVBoxLayout* templateInfoLayout = new QVBoxLayout(templateInfoGroup);

    QLabel* titleLabel = new QLabel("Shablon nomi:");
    templateTitleEdit_ = new QLineEdit();
    templateTitleEdit_->setPlaceholderText("Masalan: Jigar UZI protokoli");
    templateTitleEdit_->setObjectName("templateTitleEdit");

    QLabel* descLabel = new QLabel("Tavsif:");
    templateDescriptionEdit_ = new QTextEdit();
    templateDescriptionEdit_->setPlaceholderText("Shablon haqida qisqacha tavsif...");
    templateDescriptionEdit_->setMaximumHeight(60);
    templateDescriptionEdit_->setObjectName("templateDescriptionEdit");

    templateInfoLayout->addWidget(titleLabel);
    templateInfoLayout->addWidget(templateTitleEdit_);
    templateInfoLayout->addWidget(descLabel);
    templateInfoLayout->addWidget(templateDescriptionEdit_);

    mainLayout->addWidget(templateInfoGroup);

    // Main content - Fields list and editor
    QHBoxLayout* contentLayout = new QHBoxLayout();

    // Left side - Field list
    QGroupBox* fieldsListGroup = new QGroupBox("Maydonlar ro'yxati");
    QVBoxLayout* fieldsListLayout = new QVBoxLayout(fieldsListGroup);

    fieldListWidget_ = new QListWidget();
    fieldListWidget_->setObjectName("fieldListWidget");
    connect(fieldListWidget_, &QListWidget::currentRowChanged, this, &TemplateBuilder::onFieldSelected);

    QHBoxLayout* listButtonsLayout = new QHBoxLayout();
    addFieldButton_ = new QPushButton("+ Qo'shish");
    removeFieldButton_ = new QPushButton("- O'chirish");
    moveUpButton_ = new QPushButton("Yuqoriga");
    moveDownButton_ = new QPushButton("Pastga");

    addFieldButton_->setObjectName("addFieldButton");
    removeFieldButton_->setObjectName("removeFieldButton");

    connect(addFieldButton_, &QPushButton::clicked, this, &TemplateBuilder::onAddFieldClicked);
    connect(removeFieldButton_, &QPushButton::clicked, this, &TemplateBuilder::onRemoveFieldClicked);
    connect(moveUpButton_, &QPushButton::clicked, this, &TemplateBuilder::onMoveFieldUpClicked);
    connect(moveDownButton_, &QPushButton::clicked, this, &TemplateBuilder::onMoveFieldDownClicked);

    listButtonsLayout->addWidget(addFieldButton_);
    listButtonsLayout->addWidget(removeFieldButton_);
    listButtonsLayout->addWidget(moveUpButton_);
    listButtonsLayout->addWidget(moveDownButton_);

    fieldsListLayout->addWidget(fieldListWidget_);
    fieldsListLayout->addLayout(listButtonsLayout);

    // Right side - Field editor
    QGroupBox* fieldEditorGroup = new QGroupBox("Maydon sozlamalari");
    QVBoxLayout* fieldEditorLayout = new QVBoxLayout(fieldEditorGroup);

    QGridLayout* editorGrid = new QGridLayout();

    editorGrid->addWidget(new QLabel("Maydon nomi (ID):"), 0, 0);
    fieldNameEdit_ = new QLineEdit();
    fieldNameEdit_->setPlaceholderText("masalan: liver_size");
    fieldNameEdit_->setObjectName("fieldNameEdit");
    editorGrid->addWidget(fieldNameEdit_, 0, 1);

    editorGrid->addWidget(new QLabel("Yorliq (Label):"), 1, 0);
    fieldLabelEdit_ = new QLineEdit();
    fieldLabelEdit_->setPlaceholderText("masalan: Jigar o'lchami");
    fieldLabelEdit_->setObjectName("fieldLabelEdit");
    editorGrid->addWidget(fieldLabelEdit_, 1, 1);

    editorGrid->addWidget(new QLabel("Maydon turi:"), 2, 0);
    fieldTypeCombo_ = new QComboBox();
    fieldTypeCombo_->addItems({"combobox", "text", "number", "date", "textarea"});
    fieldTypeCombo_->setObjectName("fieldTypeCombo");
    editorGrid->addWidget(fieldTypeCombo_, 2, 1);

    editorGrid->addWidget(new QLabel("Qator (row):"), 3, 0);
    rowPositionSpinBox_ = new QSpinBox();
    rowPositionSpinBox_->setRange(0, 50);
    editorGrid->addWidget(rowPositionSpinBox_, 3, 1);

    editorGrid->addWidget(new QLabel("Ustun (column):"), 4, 0);
    columnPositionSpinBox_ = new QSpinBox();
    columnPositionSpinBox_->setRange(0, 1);
    editorGrid->addWidget(columnPositionSpinBox_, 4, 1);

    isRequiredCheckbox_ = new QCheckBox("Majburiy maydon");
    editorGrid->addWidget(isRequiredCheckbox_, 5, 0, 1, 2);

    fieldEditorLayout->addLayout(editorGrid);

    // Default values section (for combobox)
    QGroupBox* defaultValuesGroup = new QGroupBox("Standart qiymatlar (ComboBox uchun)");
    QVBoxLayout* defaultValuesLayout = new QVBoxLayout(defaultValuesGroup);

    defaultValuesListWidget_ = new QListWidget();
    defaultValuesListWidget_->setMaximumHeight(120);

    QHBoxLayout* defaultValueInputLayout = new QHBoxLayout();
    defaultValueEdit_ = new QLineEdit();
    defaultValueEdit_->setPlaceholderText("Yangi qiymat kiriting...");
    addDefaultValueButton_ = new QPushButton("+");
    addDefaultValueButton_->setMaximumWidth(40);
    removeDefaultValueButton_ = new QPushButton("-");
    removeDefaultValueButton_->setMaximumWidth(40);

    connect(addDefaultValueButton_, &QPushButton::clicked, this, &TemplateBuilder::onAddDefaultValueClicked);
    connect(removeDefaultValueButton_, &QPushButton::clicked, this, &TemplateBuilder::onRemoveDefaultValueClicked);

    defaultValueInputLayout->addWidget(defaultValueEdit_);
    defaultValueInputLayout->addWidget(addDefaultValueButton_);
    defaultValueInputLayout->addWidget(removeDefaultValueButton_);

    defaultValuesLayout->addWidget(defaultValuesListWidget_);
    defaultValuesLayout->addLayout(defaultValueInputLayout);

    fieldEditorLayout->addWidget(defaultValuesGroup);

    contentLayout->addWidget(fieldsListGroup, 1);
    contentLayout->addWidget(fieldEditorGroup, 2);

    mainLayout->addLayout(contentLayout);

    // Bottom buttons
    QHBoxLayout* bottomButtonsLayout = new QHBoxLayout();
    previewButton_ = new QPushButton("Ko'rish (Preview)");
    saveButton_ = new QPushButton("Saqlash");
    cancelButton_ = new QPushButton("Bekor qilish");

    saveButton_->setObjectName("saveButton");
    cancelButton_->setObjectName("cancelButton");

    connect(previewButton_, &QPushButton::clicked, this, &TemplateBuilder::onPreviewClicked);
    connect(saveButton_, &QPushButton::clicked, this, &TemplateBuilder::onSaveTemplateClicked);
    connect(cancelButton_, &QPushButton::clicked, this, &TemplateBuilder::onCancelClicked);

    bottomButtonsLayout->addStretch();
    bottomButtonsLayout->addWidget(previewButton_);
    bottomButtonsLayout->addWidget(saveButton_);
    bottomButtonsLayout->addWidget(cancelButton_);

    mainLayout->addLayout(bottomButtonsLayout);

    // Scroll area'ni sozlash
    scrollArea->setWidget(scrollContent);
    dialogLayout->addWidget(scrollArea);
}

void TemplateBuilder::setupStyles()
{
    setStyleSheet(R"(
        QDialog {
            background-color: #FAFAFA;
        }
        QGroupBox {
            font-weight: bold;
            border: 1px solid #E0E0E0;
            border-radius: 8px;
            margin-top: 12px;
            padding-top: 12px;
            background: #FAFAFA;
        }
        QGroupBox::title {
            subcontrol-origin: margin;
            left: 12px;
            padding: 0 8px;
            color: #333;
        }
        QLineEdit, QTextEdit, QComboBox, QSpinBox {
            background-color: #F9F9F9;
            border-radius: 6px;
            border: 1px solid #E0E0E0;
            color: #333333;
            font-size: 14px;
            padding: 8px;
            min-height: 32px;
        }
        QLineEdit:focus, QTextEdit:focus, QComboBox:focus {
            border: 1.5px solid #4CAF50;
        }
        QListWidget {
            background-color: #FFFFFF;
            border-radius: 6px;
            border: 1px solid #E0E0E0;
            color: #333;
        }
        QListWidget::item {
            padding: 8px;
            border-bottom: 1px solid #F0F0F0;
        }
        QListWidget::item:selected {
            background-color: #E8F5E9;
            color: #333;
        }
        QPushButton {
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: bold;
        }
        QPushButton:hover {
            background-color: #45A049;
        }
        QPushButton#cancelButton {
            background-color: #9E9E9E;
        }
        QPushButton#cancelButton:hover {
            background-color: #757575;
        }
        QPushButton#removeFieldButton {
            background-color: #F44336;
        }
        QPushButton#removeFieldButton:hover {
            background-color: #D32F2F;
        }
        QCheckBox {
            color: #333;
            font-size: 14px;
        }
        QLabel {
            color: #333;
            font-size: 14px;
        }
    )");
}

void TemplateBuilder::loadTemplate()
{
    if (!templateUseCase_ || templateId_ <= 0) return;

    auto templ = templateUseCase_->getTemplateById(templateId_);
    if (!templ) return;

    templateTitleEdit_->setText(QString::fromStdString(templ->getTitle()));
    templateDescriptionEdit_->setText(QString::fromStdString(templ->getDescription()));

    fields_.clear();
    for (const auto& field : templ->getFields()) {
        FieldData fd;
        fd.fieldName = QString::fromStdString(field->getFieldName());
        fd.fieldLabel = QString::fromStdString(field->getFieldLabel());
        fd.fieldType = QString::fromStdString(field->getFieldType());
        fd.isRequired = field->isRequired();
        fd.rowPosition = field->getRowPosition();
        fd.columnPosition = field->getColumnPosition();

        for (const auto& val : field->getDefaultValues()) {
            fd.defaultValues.append(QString::fromStdString(val));
        }

        fields_.push_back(fd);
    }

    updateFieldList();
}

void TemplateBuilder::updateFieldList()
{
    fieldListWidget_->clear();
    for (const auto& field : fields_) {
        fieldListWidget_->addItem(field.fieldLabel + " (" + field.fieldName + ")");
    }
}

void TemplateBuilder::onFieldSelected(int row)
{
    // Save current field before switching
    if (currentFieldIndex_ >= 0 && currentFieldIndex_ < static_cast<int>(fields_.size())) {
        saveCurrentFieldToList();
    }

    currentFieldIndex_ = row;

    if (row >= 0 && row < static_cast<int>(fields_.size())) {
        updateFieldEditor();
    } else {
        clearFieldEditor();
    }
}

void TemplateBuilder::updateFieldEditor()
{
    if (currentFieldIndex_ < 0 || currentFieldIndex_ >= static_cast<int>(fields_.size())) return;

    const auto& field = fields_[currentFieldIndex_];
    fieldNameEdit_->setText(field.fieldName);
    fieldLabelEdit_->setText(field.fieldLabel);
    fieldTypeCombo_->setCurrentText(field.fieldType);
    isRequiredCheckbox_->setChecked(field.isRequired);
    rowPositionSpinBox_->setValue(field.rowPosition);
    columnPositionSpinBox_->setValue(field.columnPosition);

    defaultValuesListWidget_->clear();
    for (const auto& val : field.defaultValues) {
        defaultValuesListWidget_->addItem(val);
    }
}

void TemplateBuilder::clearFieldEditor()
{
    fieldNameEdit_->clear();
    fieldLabelEdit_->clear();
    fieldTypeCombo_->setCurrentIndex(0);
    isRequiredCheckbox_->setChecked(false);
    rowPositionSpinBox_->setValue(0);
    columnPositionSpinBox_->setValue(0);
    defaultValuesListWidget_->clear();
}

void TemplateBuilder::saveCurrentFieldToList()
{
    if (currentFieldIndex_ < 0 || currentFieldIndex_ >= static_cast<int>(fields_.size())) return;

    auto& field = fields_[currentFieldIndex_];
    field.fieldName = fieldNameEdit_->text().trimmed();
    field.fieldLabel = fieldLabelEdit_->text().trimmed();
    field.fieldType = fieldTypeCombo_->currentText();
    field.isRequired = isRequiredCheckbox_->isChecked();
    field.rowPosition = rowPositionSpinBox_->value();
    field.columnPosition = columnPositionSpinBox_->value();

    field.defaultValues.clear();
    for (int i = 0; i < defaultValuesListWidget_->count(); ++i) {
        field.defaultValues.append(defaultValuesListWidget_->item(i)->text());
    }

    // Update list item text
    if (currentFieldIndex_ < fieldListWidget_->count()) {
        fieldListWidget_->item(currentFieldIndex_)->setText(
            field.fieldLabel + " (" + field.fieldName + ")");
    }
}

void TemplateBuilder::onAddFieldClicked()
{
    FieldData newField;
    newField.fieldName = QString("field_%1").arg(fields_.size() + 1);
    newField.fieldLabel = QString("Yangi maydon %1").arg(fields_.size() + 1);
    newField.fieldType = "combobox";
    newField.isRequired = false;
    newField.rowPosition = static_cast<int>(fields_.size());
    newField.columnPosition = 0;

    fields_.push_back(newField);
    updateFieldList();
    fieldListWidget_->setCurrentRow(static_cast<int>(fields_.size()) - 1);
}

void TemplateBuilder::onRemoveFieldClicked()
{
    if (currentFieldIndex_ < 0 || currentFieldIndex_ >= static_cast<int>(fields_.size())) return;

    fields_.erase(fields_.begin() + currentFieldIndex_);
    currentFieldIndex_ = -1;
    updateFieldList();
    clearFieldEditor();
}

void TemplateBuilder::onMoveFieldUpClicked()
{
    if (currentFieldIndex_ <= 0 || currentFieldIndex_ >= static_cast<int>(fields_.size())) return;

    std::swap(fields_[currentFieldIndex_], fields_[currentFieldIndex_ - 1]);
    updateFieldList();
    fieldListWidget_->setCurrentRow(currentFieldIndex_ - 1);
}

void TemplateBuilder::onMoveFieldDownClicked()
{
    if (currentFieldIndex_ < 0 || currentFieldIndex_ >= static_cast<int>(fields_.size()) - 1) return;

    std::swap(fields_[currentFieldIndex_], fields_[currentFieldIndex_ + 1]);
    updateFieldList();
    fieldListWidget_->setCurrentRow(currentFieldIndex_ + 1);
}

void TemplateBuilder::onAddDefaultValueClicked()
{
    QString value = defaultValueEdit_->text().trimmed();
    if (value.isEmpty()) return;

    defaultValuesListWidget_->addItem(value);
    defaultValueEdit_->clear();
}

void TemplateBuilder::onRemoveDefaultValueClicked()
{
    auto item = defaultValuesListWidget_->currentItem();
    if (item) {
        delete defaultValuesListWidget_->takeItem(defaultValuesListWidget_->currentRow());
    }
}

void TemplateBuilder::onSaveTemplateClicked()
{
    // Save current field first
    saveCurrentFieldToList();

    QString title = templateTitleEdit_->text().trimmed();
    if (title.isEmpty()) {
        QMessageBox::warning(this, "Xato", "Shablon nomini kiriting!");
        return;
    }

    if (fields_.empty()) {
        QMessageBox::warning(this, "Xato", "Kamida bitta maydon qo'shing!");
        return;
    }

    if (!templateUseCase_ || !allPages_ || !allPages_->userDoctor_) {
        QMessageBox::critical(this, "Xato", "Tizim xatosi!");
        return;
    }

    int64_t doctorId = allPages_->userDoctor_->getId();
    QString description = templateDescriptionEdit_->toPlainText().trimmed();

    std::shared_ptr<Domain::ProtocolTemplate> templ;

    if (templateId_ > 0) {
        // Update existing template
        templateUseCase_->updateTemplate(templateId_, title.toStdString(), description.toStdString());
        templ = templateUseCase_->getTemplateById(templateId_);
    } else {
        // Create new template
        templ = templateUseCase_->createTemplate(doctorId, title.toStdString(), description.toStdString());
        if (templ) {
            templateId_ = templ->getId();
        }
    }

    if (!templ) {
        QMessageBox::critical(this, "Xato", "Shablonni saqlashda xato!");
        return;
    }

    // Save fields
    for (size_t i = 0; i < fields_.size(); ++i) {
        const auto& fd = fields_[i];
        std::vector<std::string> defaultVals;
        for (const auto& val : fd.defaultValues) {
            defaultVals.push_back(val.toStdString());
        }

        templateUseCase_->addField(
            templateId_,
            fd.fieldName.toStdString(),
            fd.fieldLabel.toStdString(),
            fd.fieldType.toStdString(),
            defaultVals,
            fd.isRequired,
            fd.rowPosition,
            fd.columnPosition
        );
    }

    QMessageBox::information(this, "Muvaffaqiyat", "Shablon muvaffaqiyatli saqlandi!");
    accept();
}

void TemplateBuilder::onPreviewClicked()
{
    saveCurrentFieldToList();

    QString html = generatePreviewHtml();

    QDialog* previewDialog = new QDialog(this);
    previewDialog->setWindowTitle("Shablon ko'rinishi");
    previewDialog->setMinimumSize(800, 600);

    QVBoxLayout* layout = new QVBoxLayout(previewDialog);
    QWebEngineView* webView = new QWebEngineView();
    webView->setHtml(html);
    layout->addWidget(webView);

    QPushButton* closeBtn = new QPushButton("Yopish");
    connect(closeBtn, &QPushButton::clicked, previewDialog, &QDialog::close);
    layout->addWidget(closeBtn);

    previewDialog->exec();
    delete previewDialog;
}

QString TemplateBuilder::generatePreviewHtml()
{
    QString title = templateTitleEdit_->text().trimmed();

    QString html = R"(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        h1 {
            text-align: center;
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .form-row {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }
        .form-group {
            flex: 1;
        }
        .form-group label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
        }
        .required::after {
            content: " *";
            color: red;
        }
    </style>
</head>
<body>
    <h1>)" + title + R"(</h1>
    <form>
)";

    // Group fields by row
    std::map<int, std::vector<const FieldData*>> rows;
    for (const auto& field : fields_) {
        rows[field.rowPosition].push_back(&field);
    }

    for (const auto& [rowNum, rowFields] : rows) {
        html += "        <div class=\"form-row\">\n";

        // Sort by column position
        std::vector<const FieldData*> sorted = rowFields;
        std::sort(sorted.begin(), sorted.end(), [](const FieldData* a, const FieldData* b) {
            return a->columnPosition < b->columnPosition;
        });

        for (const auto* field : sorted) {
            QString requiredClass = field->isRequired ? " required" : "";

            html += "            <div class=\"form-group\">\n";
            html += QString("                <label class=\"%1\">%2</label>\n")
                        .arg(requiredClass, field->fieldLabel);

            if (field->fieldType == "combobox") {
                html += QString("                <select name=\"%1\">\n").arg(field->fieldName);
                html += "                    <option value=\"\">Tanlang...</option>\n";
                for (const auto& val : field->defaultValues) {
                    html += QString("                    <option value=\"%1\">%1</option>\n").arg(val);
                }
                html += "                </select>\n";
            } else if (field->fieldType == "textarea") {
                html += QString("                <textarea name=\"%1\" rows=\"3\"></textarea>\n")
                            .arg(field->fieldName);
            } else if (field->fieldType == "number") {
                html += QString("                <input type=\"number\" name=\"%1\">\n")
                            .arg(field->fieldName);
            } else if (field->fieldType == "date") {
                html += QString("                <input type=\"date\" name=\"%1\">\n")
                            .arg(field->fieldName);
            } else {
                html += QString("                <input type=\"text\" name=\"%1\">\n")
                            .arg(field->fieldName);
            }

            html += "            </div>\n";
        }

        html += "        </div>\n";
    }

    html += R"(
    </form>
</body>
</html>
)";

    return html;
}

void TemplateBuilder::onCancelClicked()
{
    reject();
}
