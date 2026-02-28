#ifndef CLIENTFORM_H
#define CLIENTFORM_H

#include <QDialog>
#include <QWidget>
#include <QString>
#include <QPropertyAnimation>
#include "../../allpages.h"
#include "../protocolchose/protocolchose.h"


namespace Ui {
class ClientForm;
}

class ClientForm : public QDialog
{
    Q_OBJECT

public:
    explicit ClientForm(AllPages* allPages = nullptr, QWidget *parent = nullptr, std::shared_ptr<Domain::Client> client = nullptr);

    ~ClientForm();

private slots:


    void on_pushButtonQuit_clicked();

    void on_pushButtonCreateClient_clicked();

    void on_pushButtonChoseProtocol_clicked();

    Common::CreateClientResponse getClientInUiInputs();

private:
    Ui::ClientForm *ui;
    AllPages* allPages_;
    std::shared_ptr<Domain::Client> client_;
};

#endif // CLIENTFORM_H
