#ifndef PROTOCOLFORMS_H
#define PROTOCOLFORMS_H

#include <QObject>
#include <QEvent>
#include <QLabel>
#include <QMessageBox>
#include <memory>



class AllPages;
namespace Ui { class AllPages; }
namespace Domain { class Client; }
namespace Common {
template<typename T> struct PaginationResponse;
struct PaginationRequest;
struct ProtocolFormsResponse;
struct ProtocolForms;
}

class ProtocolForms
{
public:
    ProtocolForms(AllPages* parent);

    void diplayClientProtoclForm();
    void editProtocoleForm(QMap<QString, QString> clientProtocolForm);
    QString fillHtmlTemplate(const QString &templatePath, const QMap<QString, QString> &values);
    void convertHtmlToPdf(const QString &inputHtmlPath, const QString &outputPdfPath);
    void showProtocoleFillPage(bool check, const QString &protocolFormCreateDateTime = "");
    void showShtavitkaPage(bool check);

    void pushButtonSaveProtocol();
    void pushButtonSaveProtocol_sh();
    void pushButtonSaveProtocol_Selezenki();
    void pushButtonSaveProtocol_KolloniSustav();
    void pushButtonSaveProtocol_Nadpochechniki();
    void pushButtonSaveProtocol_TremestrBer();
    void pushButtonSaveProtocol_Follik();
    void pushButtonSaveProtocol_PechenBlank();
    void pushButtonSaveProtocol_MaliyTazBlank();
    void pushButtonSaveProtocol_PochkiBlank();
    void pushButtonSaveProtocol_MalochniyJelBlank();
    void pushButtonSaveProtocol_prastataBlank();
    void pushButtonSaveProtocol_podjeludochBlank();
    void pushButtonSaveProtocol_plodBlank();


    QString lastPdfSavePath;
private:
    AllPages* parent_;
    Ui::AllPages* ui();
};

#endif // PROTOCOLFORMS_H
