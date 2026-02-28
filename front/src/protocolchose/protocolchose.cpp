#include "protocolchose.h"
#include "ui_protocolchose.h"
#include "../../allpages.h"

ProtocolChose::ProtocolChose(QWidget *parent, AllPages *AllPage, int64_t clientId)
    : QDialog(parent)
    , ui(new Ui::ProtocolChose)
    , allPages_(AllPage)
    , clientId_(clientId)
{
    ui->setupUi(this);
    setWindowFlags(Qt::Dialog | Qt::FramelessWindowHint);
    if (parent)
    {
        QRect parentRect = parent->geometry();
        QPoint center = parent->mapToGlobal(parentRect.center());
        move(center - QPoint(width() / 2, height() / 2));
    }
    QVector<QPushButton*> protocolButtons = getProtocolButtons();
    size_t displayCount = calculateButtons(
        protocolButtons.size(),
        allPages_->doctorProtocols_.items.size()
        );
    for (size_t i = 0; i < displayCount; ++i) {
        if (protocolButtons[i]) {
            QString text = QString::fromStdString(allPages_->doctorProtocols_.items[i].protocolTitle);
            text.replace(" ", "\n");
            protocolButtons[i]->setText(text);
        }
    }
}

ProtocolChose::~ProtocolChose()
{
    delete ui;
}

void ProtocolChose::on_pushButtonQuit1_clicked()
{
    this->close();
}

void ProtocolChose::on_MashonkaButton_clicked()
{
    QString protocolTitle = ui->MashonkaButton->text().trimmed();
    protocolTitle.replace("\n", " ");
    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}

void ProtocolChose::on_ShtavitkaButton_clicked()
{
    QString protocolTitle = ui->ShtavitkaButton->text().trimmed();
    protocolTitle.replace("\n", " ");
    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}

QVector<QPushButton*> ProtocolChose::getProtocolButtons() {
    QVector<QPushButton*> buttons;
    if (ui->MashonkaButton) buttons.push_back(ui->MashonkaButton);
    if (ui->ShtavitkaButton) buttons.push_back(ui->ShtavitkaButton);
    if (ui->SelezyankiButton) buttons.push_back(ui->SelezyankiButton);
    if (ui->KolonniSustavButton) buttons.push_back(ui->KolonniSustavButton);
    if (ui->NadpochechnikiButton) buttons.push_back(ui->NadpochechnikiButton);
    if (ui->PervomTremeteriBerButton) buttons.push_back(ui->PervomTremeteriBerButton);
    if (ui->FollikButton) buttons.push_back(ui->FollikButton);
    if (ui->PechenBlankButton) buttons.push_back(ui->PechenBlankButton);
    if (ui->PochkiBlankButton) buttons.push_back(ui->PochkiBlankButton);
    if (ui->maliyTazBlankButton) buttons.push_back(ui->maliyTazBlankButton);
    if (ui->malochniyJelBlankButton) buttons.push_back(ui->malochniyJelBlankButton);
    if (ui->podjeludochBlankButton) buttons.push_back(ui->podjeludochBlankButton);
    if (ui->prastataBlankButton) buttons.push_back(ui->prastataBlankButton);
    if (ui->plodBlankButton) buttons.push_back(ui->plodBlankButton);
    return buttons;
}

size_t ProtocolChose::calculateButtons(size_t size1, size_t size2) const
{
    return std::min({size1, size2});
}

void ProtocolChose::on_SelezyankiButton_clicked()
{
    QString protocolTitle = ui->SelezyankiButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_KolonniSustavButton_clicked()
{
    QString protocolTitle = ui->KolonniSustavButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_NadpochechnikiButton_clicked()
{
    QString protocolTitle = ui->NadpochechnikiButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_PervomTremeteriBerButton_clicked()
{
    QString protocolTitle = ui->PervomTremeteriBerButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}



void ProtocolChose::on_FollikButton_clicked()
{
    QString protocolTitle = ui->FollikButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_PechenBlankButton_clicked()
{
    QString protocolTitle = ui->PechenBlankButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_PochkiBlankButton_clicked()
{
    QString protocolTitle = ui->PochkiBlankButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_maliyTazBlankButton_clicked()
{
    QString protocolTitle = ui->maliyTazBlankButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_malochniyJelBlankButton_clicked()
{
    QString protocolTitle = ui->malochniyJelBlankButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_podjeludochBlankButton_clicked()
{
    QString protocolTitle = ui->podjeludochBlankButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_prastataBlankButton_clicked()
{
    QString protocolTitle = ui->prastataBlankButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}


void ProtocolChose::on_plodBlankButton_clicked()
{
    QString protocolTitle = ui->plodBlankButton->text().trimmed();
    protocolTitle.replace("\n", " ");

    allPages_->protocolTitle_ = protocolTitle;
    allPages_->currentProtocolId_ = allPages_->protocolMap_.value(protocolTitle, -1);
    if(allPages_->whoPage_ == allPages_->Pages::ClinetProtocols) {
        allPages_->whoPage_ = allPages_->Pages::ProtocolClient;
        allPages_->protocolParts.loadProtocolsPage();
    } else {
        if(clientId_ != 0) {
            allPages_->currentClientId_ = clientId_;
        }
        allPages_->protocolForms.showProtocoleFillPage(false);
    }
    this->close();
}

