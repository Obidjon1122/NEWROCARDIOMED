#ifndef ALLPAGES_H
#define ALLPAGES_H

#pragma once
#include <QMainWindow>
#include <QHash>
#include <QVector>
#include <QLabel>
#include <QComboBox>
#include <QWidget>
#include <QMessageBox>
#include <QDebug>
#include <QTimer>
#include <QPixmap>
#include <QAbstractItemView>
#include <QPoint>
#include <QProcess>
#include <QFile>
#include <memory>
#include <QList>
#include <QJsonDocument>  // JSON hujjatlarini yaratish/parse qilish uchun
#include <QJsonObject>    // JSON obyektlarini ishlatish uchun
#include <QJsonArray>

#include "src/protocolchose/protocolchose.h"
#include "src/calendar/searchcalendardilalog.h"
#include "../back/application/index.h"

#include <QApplication>
#include <QWebEnginePage>
#include <QWebEngineProfile>
#include <QUrl>
#include <QFileInfo>
#include <QPageLayout>
#include <QPageSize>
#include <QMarginsF>
#include <QPageRanges>
#include <QDir>
#include <QTextStream>
#include <QTemporaryFile>
#include <QWebEngineView>
#include <QFileDialog>
#include <QScrollArea>

#include "src/clientparts/clientparts.h"
#include "src/protocolparts/protocolparts.h"
#include "src/protocolforms/protocolforms.h"
#include "src/templatebuilder/templatebuilder.h"

#ifdef QT_WEBENGINECORE_LIB
#include <QWebEnginePage>
#include <QWebEngineView>
#define WEBENGINE_AVAILABLE
#endif


class UpdateClientOrCreateProtocol;
class ClientForm;


QT_BEGIN_NAMESPACE
namespace Ui {
class AllPages;
}
QT_END_NAMESPACE

class AllPages : public QMainWindow
{
    Q_OBJECT

public:
    explicit AllPages(Nevrocardiomed::Application& app, QWidget* parent = nullptr);

    ClientParts clientParts;
    ProtocolParts protocolParts;
    ProtocolForms protocolForms;

    ~AllPages() override;
    UseCase::ClientUseCase* clientUseCase_;
    void updateClient_(std::shared_ptr<Domain::Client> client);


    bool eventFilter(QObject* watched, QEvent* event) override;
    void updateButtonsForId();

private slots:
    void on_loginPushButton_clicked();
    void on_pushButtonNextClients_clicked();
    void on_pushButtonBackClients_clicked();
    void on_pushButtonSearch_clicked();

    void on_pushButtonCreateClient_clicked();

    void on_pushButtonSaveProtocol_clicked();

    void on_pushButtonShow_clicked();

    void on_pushButtonSave_sh_clicked();

    void on_pushButtonSaveProtocolSelezenki_clicked();

    void on_KolloniSustavSaveButton_clicked();

    void on_NadpochechnikiSaveButton_clicked();

    void on_pushButtonSaveProtocolTremestBer_clicked();

    void on_FollikSaveButton_clicked();

    void on_pechenBlankSavePushButton_clicked();

    void on_MaliySaveButton_clicked();

    void on_PochkiSaveButton_clicked();

    void on_MalochniySaveButton_clicked();

    void on_PochkiSaveButton_2_clicked();

private:
    QString lastPdfSavePath;
    void initializeUseCases();
    void connectSignals();

    void setupEventFilters();
    void installNavigationFilters();
    void installProtocolFilters();
    void installClientRowFilters();
    void installWidgetFilter(QWidget* widget);
    void setupProtocolClientRowFilters(QWidget* parentWidget);

    void initializeUIState();
    void setupProtocolScrollAreas();
    void setupDashboardScrollArea();
    void setupAddTemplateButton();

    void attemptLogin(const QString& phone, const QString& password);
    void handleSuccessfulLogin(std::shared_ptr<Domain::User> user);
    void showLoginError(const QString& message);
    bool validateLoginInput(const QString& phone, const QString& password);

    void logout();
    void clearSessionData();
    void resetUIToLoginState();

public:
    void loadDashboardWindow();
    void loadProtocolsIfNeeded();
    void updateUserInterface();

    void loadHomePage();
    void loadProtocolWindow();
    void loadClientPageProtocolId(int64_t clientId, int64_t protocolId);
    // void loadClientPageProtocolIdSearchDate(QString date);

    void protocolChoseDialog();
    void openTemplateBuilder(int64_t templateId = 0);

public:
    Common::ProtocolFormsResponse getProtocolIdFormsResponse(
        const Common::PaginationRequest& request,
        int64_t clientId,
        int64_t protocolId
        );

    void displayProtocols();

    void clearClientLabels();
    void clearLabels(const QVector<QLabel*>& labels);

    QVector<QWidget*> getProtocolWidgets() const;
    QVector<QLabel*> getProtocolLabels() const;

    void setUserAvatar();
    QString getAvatarPath() const;
    void setScaledPixmap(QLabel* label, const QPixmap& pixmap);


    void updatePaginationButtons(bool hasNext, bool hasPrevious);
    void navigateToNextPage();
    void navigateToPreviousPage();
public:
    void refreshCurrentPage();
public:
    void loadComboBoxItems();
    void saveComboBoxItems();

    bool handleClientRowEvents(QObject* watched, QEvent* event);
    bool handleProtocolWidgetClick(QObject* watched, QEvent* event);
    bool handleNavigationEvents(QObject* watched, QEvent* event);

    bool handleHomeNavigation(QObject* watched, QEvent* event);
    bool handleLogoutNavigation(QObject* watched, QEvent* event);

    void setHomeStyle(bool isHovered);
    void setLogoutStyle(bool isHovered);

    void handleProtocolRowHover(QWidget* parentWidget, bool isEntering);

    void applyHoverProperty(QWidget* widget, bool isHovered);

    template<typename T>
    void applyHoverToChildren(QWidget* parent, bool isHovered);

    bool hasValidClientId(QWidget* widget) const;

    bool isProtocolWidget(QObject* watched);
    bool isProtocol1Widget(QObject* watched) const;
    bool isProtocol2Widget(QObject* watched) const;
    bool isProtocol3Widget(QObject* watched) const;
    bool isProtocol4Widget(QObject* watched) const;
    bool isProtocol5Widget(QObject* watched) const;
    bool isProtocol6Widget(QObject* watched) const;
    bool isProtocol7Widget(QObject* watched) const;
    bool isProtocol8Widget(QObject* watched) const;

    bool isDialogOpen_ = false;

    QVector<QLabel*> getClientFullNameLabels() const;
    QVector<QLabel*> getClientBirthDateLabels() const;


    void showError(const QString& title, const QString& message);
public:
    Ui::AllPages* ui;
public:
    Nevrocardiomed::Application& app_;

    UseCase::UserUseCase* userUseCase_;
    UseCase::ProtocolUseCase* protocolUseCase_;

    std::shared_ptr<Domain::User> userDoctor_;

    ClientForm* ClientCreater;
    UpdateClientOrCreateProtocol* UpdateOrCreate_;
    QWidget* overlayWidget_;

public:
    QHash<QString, int64_t> protocolMap_;
    int64_t currentClientId_ = -1;
    int64_t currentProtocolFormId_ = -1;
    int64_t currentProtocolId_ = -1;
    QString protocolTitle_;
    Common::ProtocolDashboardResponse doctorProtocols_;
    enum Pages {
        Dashboard,
        Protocol,
        ProtocolClient,
        Clients,
        ClinetProtocols,
    };

    Pages whoPage_;
public:
    bool loadedDoctorProtocols_ = false;
    int currentPage_ = 1;
    int totalPages_ = 1;

    static constexpr int MAX_CLIENTS_PER_PAGE = 10;
    static constexpr double COMBO_BOX_HEIGHT = 52.0;
};

#endif // ALLPAGES_H
