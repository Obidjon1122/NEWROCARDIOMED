#include "clientparts.h"
#include "../../allpages.h"
#include "../../ui_allpages.h"
#include "../utils.h"

ClientParts::ClientParts(AllPages* parent)
    : parent_(parent)
{
}

Ui::AllPages* ClientParts::ui()
{
    return parent_->ui;
}

bool ClientParts::handleClientsNavigation(QObject* watched, QEvent* event)
{
    if (watched == ui()->widgetClients || watched == ui()->labelClients) {
        if (event->type() == QEvent::Enter) {
            setClientsStyle(true);
        }
        else if (event->type() == QEvent::Leave) {
            setClientsStyle(false);
        }
        else if (event->type() == QEvent::MouseButtonPress) {
            parent_->whoPage_ = AllPages::Pages::Clients;
            parent_->currentPage_ = 1;
            ui()->searchLineEdit->clear();
            loadClientsPage();
            return true;
        }
    }
    return false;
}

void ClientParts::loadClientsPage()
{
    ui()->PAGE->setText("Пациенты");

    try {
        Common::PaginationRequest request;
        request.page = parent_->currentPage_;
        request.sortBy = "updated_at";
        request.sortOrder = "DESC";
        QString searchQuery = ui()->searchLineEdit->text().trimmed();
        Common::PaginationResponse<Domain::Client> clients =
            parent_->clientUseCase_->getAllClients(request, searchQuery.toUtf8().toStdString());
        displayClients(clients);
    }
    catch (const std::exception& e) {
        QMessageBox::warning(parent_, "Ошибка", "Не удалось загрузить пациентов");
    }
}

void ClientParts::displayClients(const Common::PaginationResponse<Domain::Client>& clients)
{
    parent_->totalPages_ = clients.totalPages;

    QVector<QLabel*> clientFullNameLabels = parent_->getClientFullNameLabels();
    QVector<QLabel*> clientBirthDateLabels = parent_->getClientBirthDateLabels();
    parent_->clearClientLabels();

    ui()->labelTableTitle->setText("Ф.И");
    ui()->labelTableDate->setText("Дата рождения");

    size_t displayCount = utils::calculateDisplayCount(
        clientFullNameLabels.size(),
        clients.items.size()
        );

    for (size_t i = 0; i < displayCount; ++i) {
        populateClientRow(
            static_cast<int>(i),
            clients.items[i],
            clientFullNameLabels[i],
            clientBirthDateLabels[i]
            );
    }

    ui()->searchLineEdit->setVisible(true);
    ui()->searchLineEdit->setEnabled(true);
    ui()->searchLineEdit->setPlaceholderText("Qidirish: ism, familiya yoki telefon");
    ui()->pushButtonSearch->setVisible(false);
    ui()->pushButtonSearch->setEnabled(false);

    parent_->updatePaginationButtons(clients.hasNext, clients.hasPrevious);
    parent_->updateButtonsForId();
    ui()->stackedWidget_2->setCurrentWidget(ui()->ProtocolPageClient);
    ui()->stackedWidget_5->setCurrentWidget(ui()->Clients_protocoles_list);
}

void ClientParts::populateClientRow(
    int index,
    const std::shared_ptr<Domain::Client>& client,
    QLabel* nameLabel,
    QLabel* dateLabel)
{
    QString widgetName = QString("widgetProtocol1_%1").arg(index + 1);
    QWidget* rowWidget = parent_->findChild<QWidget*>(widgetName);

    if (nameLabel && dateLabel) {
        nameLabel->setText(QString::fromStdString(client->getFullName()));

        QString birthDate = QString::fromStdString(client->getBirthDate());
        // QString year = utils::extractYear(birthDate);
        QString formattedDate = QString("%1 год").arg(birthDate);

        dateLabel->setText(formattedDate);
    }

    if (rowWidget) {
        rowWidget->setProperty("clientId", static_cast<qlonglong>(client->getId()));
    }
}

void ClientParts::setClientsStyle(bool isHovered)
{
    if (isHovered) {
        ui()->widgetClients->setStyleSheet("background-color: #FFFFFF; border-radius: 10px;");
        ui()->labelClients->setStyleSheet("background-color: #FFFFFF; image:url(:/icons/media/icons/clinical-trials_2.png);");
    } else {
        ui()->widgetClients->setStyleSheet("background-color: #69DFD9; border-radius: 10px;");
        ui()->labelClients->setStyleSheet("background-color: #69DFD9; image:url(:/icons/media/icons/clinical-trials_1.png);");
    }
}

