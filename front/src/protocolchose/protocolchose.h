#ifndef PROTOCOLCHOSE_H
#define PROTOCOLCHOSE_H

#include <QDialog>


class AllPages;


namespace Ui {
class ProtocolChose;
}

class ProtocolChose : public QDialog
{
    Q_OBJECT

public:
    explicit ProtocolChose(QWidget *parent = nullptr, AllPages *AllPage = nullptr, int64_t clientId = 0);

    ~ProtocolChose();
private slots:
    void on_pushButtonQuit1_clicked();

    void on_MashonkaButton_clicked();

    void on_ShtavitkaButton_clicked();

    void on_SelezyankiButton_clicked();

    void on_KolonniSustavButton_clicked();

    void on_NadpochechnikiButton_clicked();

    void on_PervomTremeteriBerButton_clicked();

    void on_FollikButton_clicked();

    void on_PechenBlankButton_clicked();

    void on_PochkiBlankButton_clicked();

    void on_maliyTazBlankButton_clicked();

    void on_malochniyJelBlankButton_clicked();

    void on_podjeludochBlankButton_clicked();

    void on_prastataBlankButton_clicked();

    void on_plodBlankButton_clicked();

private:
    Ui::ProtocolChose *ui;
    AllPages* allPages_;
    int64_t clientId_;

    QVector<QPushButton*> getProtocolButtons();
    size_t calculateButtons(size_t size1, size_t size2) const;
};

#endif // PROTOCOLCHOSE_H
