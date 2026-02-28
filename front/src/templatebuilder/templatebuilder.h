#ifndef TEMPLATEBUILDER_H
#define TEMPLATEBUILDER_H

#include <QDialog>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QGridLayout>
#include <QLineEdit>
#include <QComboBox>
#include <QPushButton>
#include <QLabel>
#include <QListWidget>
#include <QScrollArea>
#include <QGroupBox>
#include <QSpinBox>
#include <QCheckBox>
#include <QTextEdit>
#include <QMessageBox>
#include <memory>
#include <vector>

#include "../../../back/usecase/protocol_template/index.h"
#include "../../../back/domain/protocol_template/index.h"

class AllPages;

class TemplateBuilder : public QDialog
{
    Q_OBJECT

public:
    explicit TemplateBuilder(QWidget* parent = nullptr,
                            AllPages* allPages = nullptr,
                            int64_t templateId = 0);
    ~TemplateBuilder();

private slots:
    void onAddFieldClicked();
    void onRemoveFieldClicked();
    void onMoveFieldUpClicked();
    void onMoveFieldDownClicked();
    void onFieldSelected(int row);
    void onSaveTemplateClicked();
    void onPreviewClicked();
    void onCancelClicked();
    void onAddDefaultValueClicked();
    void onRemoveDefaultValueClicked();

private:
    void setupUI();
    void setupStyles();
    void loadTemplate();
    void updateFieldList();
    void updateFieldEditor();
    void clearFieldEditor();
    void saveCurrentFieldToList();
    QString generatePreviewHtml();

    AllPages* allPages_;
    UseCase::ProtocolTemplateUseCase* templateUseCase_;
    int64_t templateId_;
    int currentFieldIndex_;

    struct FieldData {
        QString fieldName;
        QString fieldLabel;
        QString fieldType;
        QStringList defaultValues;
        bool isRequired;
        int rowPosition;
        int columnPosition;
    };

    std::vector<FieldData> fields_;

    // UI elements
    QLineEdit* templateTitleEdit_;
    QTextEdit* templateDescriptionEdit_;
    QListWidget* fieldListWidget_;

    // Field editor
    QLineEdit* fieldNameEdit_;
    QLineEdit* fieldLabelEdit_;
    QComboBox* fieldTypeCombo_;
    QListWidget* defaultValuesListWidget_;
    QLineEdit* defaultValueEdit_;
    QCheckBox* isRequiredCheckbox_;
    QSpinBox* rowPositionSpinBox_;
    QSpinBox* columnPositionSpinBox_;

    // Buttons
    QPushButton* addFieldButton_;
    QPushButton* removeFieldButton_;
    QPushButton* moveUpButton_;
    QPushButton* moveDownButton_;
    QPushButton* addDefaultValueButton_;
    QPushButton* removeDefaultValueButton_;
    QPushButton* saveButton_;
    QPushButton* previewButton_;
    QPushButton* cancelButton_;
};

#endif // TEMPLATEBUILDER_H
