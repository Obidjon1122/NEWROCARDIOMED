#include "protocolparts.h"

#include "../../allpages.h"
#include "../../ui_allpages.h"
#include "../utils.h"

ProtocolParts::ProtocolParts(AllPages* parent)
    :parent_(parent)
{
}

Ui::AllPages* ProtocolParts::ui()
{
    return parent_->ui;
}


void ProtocolParts::loadProtocolsPage()
{
    try {
        ui()->searchLineEdit->setVisible(false);
        ui()->searchLineEdit->setEnabled(false);
        ui()->searchLineEdit->blockSignals(true);
        ui()->searchLineEdit->clear();
        ui()->searchLineEdit->blockSignals(false);
        ui()->labelTableTitle->setText("Протоколы");
        ui()->labelTableDate->setText("Дата создания протокола");

        auto client = parent_->clientUseCase_->getClientById(parent_->currentClientId_);
        if (!client) {
            return;
        }

        Common::PaginationRequest request;
        request.page = parent_->currentPage_;

        Common::ProtocolFormsResponse response = getProtocolFormsResponse(request);

        ui()->PAGE->setText(QString::fromStdString(client->getFullName()));
        displayProtocolAndClientId(response);
    }
    catch (const std::exception& e) {
        QMessageBox::warning(parent_, "Ошибка", "Не удалось загрузить данные пациента");
    }
}

Common::ProtocolFormsResponse ProtocolParts::getProtocolFormsResponse(
    const Common::PaginationRequest& request)
{
    Common::ProtocolFormsResponse response;
    if (parent_->whoPage_ == AllPages::Pages::ProtocolClient) {
        response = parent_->protocolUseCase_->getProtocolIdAndClientId(request, parent_->currentClientId_, parent_->currentProtocolId_);
    } else if(parent_->whoPage_ == AllPages::Pages::ClinetProtocols) {
        response = parent_->protocolUseCase_->getClientId(request, parent_->currentClientId_);
    }
    return response;
}

void ProtocolParts::loadClientPageProtocolIdSearchDate(QString date) {
    if (parent_->currentClientId_ <= 0) {
        return;
    }

    try {
        Common::PaginationRequest request;
        Common::ProtocolFormsResponse response =
            parent_->protocolUseCase_->getProtocolIdAndClientId(
                request,
                parent_->currentClientId_,
                parent_->currentProtocolId_,
                date.toUtf8().toStdString()
                );
        displayProtocolAndClientId(response);

    }
    catch (const std::exception& e) {
    }
}


void ProtocolParts::displayProtocolAndClientId(const Common::ProtocolFormsResponse& response)
{
    parent_->totalPages_ = response.totalPages;

    QVector<QLabel*> clientFullNameLabels = parent_->getClientFullNameLabels();
    QVector<QLabel*> clientBirthDateLabels = parent_->getClientBirthDateLabels();

    clearProtocolLabels();



    size_t displayCount = utils::calculateDisplayCount(
        clientFullNameLabels.size(),
        response.items.size()
        );


    for (size_t i = 0; i < displayCount; ++i) {
        populateProtocolRow(
            static_cast<int>(i),
            response.items[i],
            clientFullNameLabels[i],
            clientBirthDateLabels[i]
            );
    }
    if(ui()->searchLineEdit->text().trimmed().isEmpty()) {
        ui()->searchLineEdit->setVisible(false);
        ui()->searchLineEdit->setEnabled(false);
        ui()->pushButtonSearch->setVisible(true);
        ui()->pushButtonSearch->setEnabled(true);
    }
    parent_->updatePaginationButtons(response.hasNext, response.hasPrevious);
    parent_->updateButtonsForId();
    ui()->stackedWidget_5->setCurrentIndex(0);
    ui()->stackedWidget_2->setCurrentIndex(1);
}

void ProtocolParts::populateProtocolRow(
    int index,
    const Common::ProtocolForms& item,
    QLabel* nameLabel,
    QLabel* dateLabel)
{
    QString widgetName = QString("widgetProtocol1_%1").arg(index + 1);
    QWidget* rowWidget = parent_->findChild<QWidget*>(widgetName);

    if (nameLabel && dateLabel) {
        nameLabel->setText(QString::fromStdString(item.protocolTitle));

        QString createdAt = QString::fromStdString(item.created_at);
        QString year = utils::extractYear(createdAt);
        QString dateRussian = utils::formatDateToRussian(createdAt);
        QString formattedDate = QString("%1 %2 год").arg(dateRussian, year);

        dateLabel->setText(formattedDate);
    }
    if (rowWidget) {
        rowWidget->setProperty("protocolId", static_cast<qlonglong>(item.protocolId));
        rowWidget->setProperty("protocolFormId", static_cast<qlonglong>(item.protocolFormId));
    }
}

void ProtocolParts::clearProtocolLabels()
{
    parent_->clearLabels(parent_->getClientFullNameLabels());
    parent_->clearLabels(parent_->getClientBirthDateLabels());

    for (int i = 1; i <= MAX_PER_PAGE; ++i) {
        QString widgetName = QString("widgetProtocol1_%1").arg(i);
        QWidget* rowWidget = parent_->findChild<QWidget*>(widgetName);
        if (!rowWidget) {
            continue;
        }
        rowWidget->setProperty("clientId", 0);
        rowWidget->setProperty("protocolId", 0);
        rowWidget->setProperty("protocolFormId", 0);
        rowWidget->update();
    }
}


