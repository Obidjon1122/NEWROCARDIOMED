#include "clientform.h"
#include "ui_clientform.h"
#include <QMessageBox>
#include <QDebug>

ClientForm::ClientForm(AllPages* allPages, QWidget *parent, std::shared_ptr<Domain::Client> client)
    : QDialog(parent)
    , ui(new Ui::ClientForm)
    , allPages_(allPages)
    , client_(client)
{
    ui->setupUi(this);
    setWindowFlags(Qt::Dialog | Qt::FramelessWindowHint);
    ui->errorInputLabel->hide();


    if (parent)
    {
        QRect parentRect = parent->geometry();
        QPoint globalPos = parent->mapToGlobal(QPoint(0,0));
        int x = globalPos.x() + (parentRect.width() - this->width()) / 2;
        int y = globalPos.y() + (parentRect.height() - this->height()) / 2;
        move(x, y);
    }

    if(client_) {
        ui->lineEditClientFullName->setText(QString::fromStdString(client->getFullName()));
        if(client->getGender() == "male") {
            ui->comboBox->setCurrentText("Мужской");
        } else {
            ui->comboBox->setCurrentText("Женский");
        }
        ui->dateEditBirthDate->setText(QString::fromStdString(client->getBirthDate()));
        ui->comboBoxClientRegion->setCurrentText(QString::fromStdString(client->getRegion()));
        ui->lineEditClientPhone->setText(QString::fromStdString(client->getPhone()));
        ui->pushButtonCreateClient->setText("Обновить клиента");
    } else {
        ui->pushButtonCreateClient->setText("Создать клиента");
    }
}

ClientForm::~ClientForm()
{
    delete ui;
}

void ClientForm::on_pushButtonQuit_clicked()
{
    this->close();
}

void ClientForm::on_pushButtonCreateClient_clicked()
{
    Common::CreateClientResponse result = getClientInUiInputs();
    if(result.error) {
        return;
    }
    allPages_->currentPage_ = 1;
    allPages_->clientParts.loadClientsPage();
    this->close();
}

void ClientForm::on_pushButtonChoseProtocol_clicked()
{
    Common::CreateClientResponse result = getClientInUiInputs();
    if(result.error) {
        return;
    }
    allPages_->currentClientId_ = result.clientId;
    auto protocolChose = new ProtocolChose(allPages_, allPages_);
    protocolChose->setAttribute(Qt::WA_DeleteOnClose);
    protocolChose->show();
    this->close();

}

Common::CreateClientResponse ClientForm::getClientInUiInputs() {
    Common::CreateClientResponse result;

    QString clientFullName = ui->lineEditClientFullName->text().trimmed();
    QStringList parts = clientFullName.split(" ", Qt::SkipEmptyParts);
    if (parts.size() < 2)
    {
        ui->errorInputLabel->setText("Пожалуйста, введите полное Ф.И.!");
        ui->errorInputLabel->show();
        return result;
    }
    ui->errorInputLabel->hide();

    QString lastName   = parts[0];
    QString firstName  = parts[1];

    std::string gender = ui->comboBox->currentText().toUtf8().toStdString();
    std::string region = ui->comboBoxClientRegion->currentText().toUtf8().toStdString();

    if(gender == "Мужской")
        gender = "male";
    else
        gender = "female";

    QString birthDate = ui->dateEditBirthDate->text().trimmed();

    if (client_) {
        UseCase::UpdateClientRequest request = {
            client_->getId(),
            lastName.toStdString(),
            firstName.toStdString(),
            gender,
            ui->lineEditClientPhone->text().toStdString(),
            birthDate.toStdString(),
            region,
        };
        result = allPages_->clientUseCase_->updateClient(request);

        if (result.error) {
            ui->errorInputLabel->setText(QString::fromStdString(result.errorMessage));
            ui->errorInputLabel->show();
            return result;
        }
    } else {
        UseCase::CreateClientRequest request = {
            lastName.toStdString(),
            firstName.toStdString(),
            gender,
            ui->lineEditClientPhone->text().toStdString(),
            birthDate.toStdString(),
            region
        };

        result = allPages_->clientUseCase_->createClient(request);

        if (result.error) {
            ui->errorInputLabel->setText(QString::fromStdString(result.errorMessage));
            ui->errorInputLabel->show();
            return result;
        }
    }
    ui->errorInputLabel->hide();
    return result;
}

