#include "allpages.h"
#include "src/clientform/clientform.h"
#include "ui_allpages.h"
#include <algorithm>
#include <QWebEnginePage>
#include <QEventLoop>
#include <QFileInfo>
#include <QDebug>
#include <QDir>
#include <QTimer>
#include <QPageLayout>
#include <QPageSize>
#include <QMarginsF>
#include <QVBoxLayout>
#include <QGridLayout>
#include "src/utils.h"

AllPages::AllPages(Nevrocardiomed::Application& app, QWidget* parent)
    : QMainWindow(parent)
    , app_(app)
    , ui(new Ui::AllPages)
    , overlayWidget_(nullptr)
    , clientParts(this)
    , protocolParts(this)
    , protocolForms(this)
{
    ui->setupUi(this);

    QIcon appIcon(":/icons/media/icons/icon.ico");
    setWindowIcon(appIcon);
    setWindowTitle("NEVROCARDIOMED - Tibbiy Dastur");
    QApplication::setWindowIcon(appIcon);

    // Birinchi widgetni olish
    QWidget* firstWidget = ui->stackedWidget_5->widget(0);

    // Birinchi widgetga stil berish
    firstWidget->setStyleSheet(
        "QLabel#labelProtocol1FullName_2 {"
        "    background-color: rgb(255, 255, 255);"
        "    font-family: 'Inter';"
        "    font-weight: 500;"
        "    font-size: 25px;"
        "    color: rgb(0, 0, 0);"
        "}"
        ""
        "QLabel#labelProtocol1FullName_2:hover {"
        "    background-color: rgb(242, 242, 242);"
        "}"
        );

    // Qolgan widgetlar uchun
    for(int i = 1; i < ui->stackedWidget_5->count(); i++) {
        QWidget* currentWidget = ui->stackedWidget_5->widget(i);
        QList<QLabel*> labels = currentWidget->findChildren<QLabel*>();

        for(QLabel* label : labels) {
            label->setStyleSheet(
                "font-family: 'Poppins';"
                "font-size: 16px;"
                "background-color: rgb(255, 255, 255);"
                "color: rgb(0, 0, 0);"
                );
        }
    }



    initializeUseCases();
    setupEventFilters();
    initializeUIState();
    connectSignals();
    loadComboBoxItems();
    setupProtocolScrollAreas();
    setupDashboardScrollArea();
    setupAddTemplateButton();
}

AllPages::~AllPages()
{
    saveComboBoxItems();
    delete ui;
}


void AllPages::initializeUseCases()
{
    userUseCase_ = app_.getUserUseCase();
    clientUseCase_ = app_.getClientUseCase();
    protocolUseCase_ = app_.getProtocolUseCase();
}

void AllPages::connectSignals()
{
    connect(ui->searchLineEdit, &QLineEdit::textChanged, this, [this]() {
        currentPage_ = 1;
        refreshCurrentPage();
    });
}

void AllPages::setupProtocolScrollAreas()
{
    // Protokol sahifalarini scroll area bilan o'rash
    QList<QWidget*> protocolPages = {
        ui->page,              // 1 - Mashonka
        ui->shtavitka,         // 2 - Shitavitka
        ui->selezyanaki,       // 3 - Selezenka
        ui->kolonnisustav,     // 4 - Kolenniy sustav
        ui->nadpochechniki,    // 5 - Nadpochechniki
        ui->pervomtrmestreber, // 6 - Perviy trimestr
        ui->follik,            // 7 - Follikometriya
        ui->pechenBlank,       // 8 - Pechen
        ui->pochkiBlank,       // 9 - Pochki
        ui->maliyTazBlank,     // 10 - Maliy taz
        ui->malochniyJelBlank, // 11 - Molochniye jelezi
        ui->plodBlank,         // 12 - Plod
        ui->podjeludochBlank,  // 13 - Podjeludochnaya
        ui->prastataBlank      // 14 - Prostata
    };

    for (QWidget* page : protocolPages) {
        if (!page) continue;

        // Sahifaning layout'ini olish
        QLayout* oldLayout = page->layout();
        if (!oldLayout) continue;

        // Barcha widgetlarni vaqtincha saqlash
        QList<QLayoutItem*> items;
        while (QLayoutItem* item = oldLayout->takeAt(0)) {
            items.append(item);
        }

        // Scroll area yaratish
        QScrollArea* scrollArea = new QScrollArea(page);
        scrollArea->setWidgetResizable(true);
        scrollArea->setFrameShape(QFrame::NoFrame);
        scrollArea->setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
        scrollArea->setVerticalScrollBarPolicy(Qt::ScrollBarAsNeeded);
        scrollArea->setStyleSheet(R"(
            QScrollArea {
                background-color: transparent;
                border: none;
            }
            QScrollBar:vertical {
                background: #F0F0F0;
                width: 10px;
                margin: 0px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical {
                background: #69DFD9;
                min-height: 30px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical:hover {
                background: #50C9C3;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
            }
        )");

        // Ichki widget yaratish
        QWidget* contentWidget = new QWidget();
        contentWidget->setObjectName(page->objectName() + "_scrollContent");

        // Yangi layout yaratish
        QVBoxLayout* contentLayout = new QVBoxLayout(contentWidget);
        contentLayout->setContentsMargins(0, 0, 0, 0);
        contentLayout->setSpacing(0);

        // Widgetlarni yangi layoutga ko'chirish
        for (QLayoutItem* item : items) {
            if (QWidget* widget = item->widget()) {
                widget->setParent(contentWidget);
                contentLayout->addWidget(widget);
            } else if (QLayout* layout = item->layout()) {
                contentLayout->addLayout(layout);
            } else if (QSpacerItem* spacer = item->spacerItem()) {
                contentLayout->addSpacerItem(spacer);
            }
        }

        scrollArea->setWidget(contentWidget);

        // Eski layoutga scroll area qo'shish
        oldLayout->addWidget(scrollArea);
    }
}

void AllPages::setupDashboardScrollArea()
{
    // Dashboard sahifasini scroll area bilan o'rash
    QWidget* dashboardPage = ui->page_Dashboard_home;
    if (!dashboardPage) return;

    QLayout* oldLayout = dashboardPage->layout();
    if (!oldLayout) return;

    // Barcha widgetlarni vaqtincha saqlash
    QList<QLayoutItem*> items;
    while (QLayoutItem* item = oldLayout->takeAt(0)) {
        items.append(item);
    }

    // Scroll area yaratish
    QScrollArea* scrollArea = new QScrollArea(dashboardPage);
    scrollArea->setWidgetResizable(true);
    scrollArea->setFrameShape(QFrame::NoFrame);
    scrollArea->setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
    scrollArea->setVerticalScrollBarPolicy(Qt::ScrollBarAsNeeded);
    scrollArea->setStyleSheet(R"(
        QScrollArea {
            background-color: #E6E5E5;
            border: none;
        }
        QScrollBar:vertical {
            background: #F0F0F0;
            width: 10px;
            margin: 0px;
            border-radius: 5px;
        }
        QScrollBar::handle:vertical {
            background: #69DFD9;
            min-height: 30px;
            border-radius: 5px;
        }
        QScrollBar::handle:vertical:hover {
            background: #50C9C3;
        }
        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
            height: 0px;
        }
    )");

    // Ichki widget yaratish
    QWidget* contentWidget = new QWidget();
    contentWidget->setObjectName("dashboardScrollContent");
    contentWidget->setStyleSheet("background-color: #E6E5E5;");

    // Yangi layout yaratish
    QVBoxLayout* contentLayout = new QVBoxLayout(contentWidget);
    contentLayout->setContentsMargins(0, 0, 0, 0);
    contentLayout->setSpacing(0);

    // Widgetlarni yangi layoutga ko'chirish
    for (QLayoutItem* item : items) {
        if (QWidget* widget = item->widget()) {
            widget->setParent(contentWidget);
            contentLayout->addWidget(widget);
        } else if (QLayout* layout = item->layout()) {
            contentLayout->addLayout(layout);
        } else if (QSpacerItem* spacer = item->spacerItem()) {
            contentLayout->addSpacerItem(spacer);
        }
    }

    scrollArea->setWidget(contentWidget);
    oldLayout->addWidget(scrollArea);
}

void AllPages::setupAddTemplateButton()
{
    // Grid layout'ni topish
    QGridLayout* gridLayout = ui->gridLayout_3;
    if (!gridLayout) {
        qDebug() << "gridLayout_3 topilmadi!";
        return;
    }

    // "+" tugmasi uchun widget yaratish
    QWidget* addTemplateWidget = new QWidget();
    addTemplateWidget->setObjectName("widgetAddTemplate");
    addTemplateWidget->setFixedSize(150, 150);
    addTemplateWidget->setCursor(Qt::PointingHandCursor);
    addTemplateWidget->setStyleSheet(R"(
        #widgetAddTemplate {
            background-color: #FFFFFF;
            border-radius: 20px;
            border: 2px dashed #69DFD9;
        }
        #widgetAddTemplate:hover {
            background-color: #E8FAF9;
            border: 2px solid #69DFD9;
        }
    )");

    // Layout yaratish
    QVBoxLayout* layout = new QVBoxLayout(addTemplateWidget);
    layout->setAlignment(Qt::AlignCenter);
    layout->setContentsMargins(10, 10, 10, 10);
    layout->setSpacing(5);

    // "+" belgisi
    QLabel* plusLabel = new QLabel("+");
    plusLabel->setObjectName("labelAddTemplatePlus");
    plusLabel->setAlignment(Qt::AlignCenter);
    plusLabel->setStyleSheet(R"(
        #labelAddTemplatePlus {
            font-size: 36px;
            font-weight: bold;
            color: #69DFD9;
            background-color: #FFFFFF;
        }
    )");

    // Matn
    QLabel* textLabel = new QLabel("Yangi\nshablon");
    textLabel->setObjectName("labelAddTemplateText");
    textLabel->setAlignment(Qt::AlignCenter);
    textLabel->setStyleSheet(R"(
        #labelAddTemplateText {
            font-family: 'Inter';
            font-size: 12px;
            font-weight: 500;
            color: #69DFD9;
            background-color: #FFFFFF;
        }
    )");

    layout->addWidget(plusLabel);
    layout->addWidget(textLabel);

    // Grid'ga qo'shish (row 2, column 0)
    gridLayout->addWidget(addTemplateWidget, 2, 0, Qt::AlignLeft | Qt::AlignTop);

    // Event filter qo'shish
    addTemplateWidget->installEventFilter(this);
    plusLabel->installEventFilter(this);
    textLabel->installEventFilter(this);
}

void AllPages::setupEventFilters()
{
    installNavigationFilters();
    installProtocolFilters();
    installClientRowFilters();
}

void AllPages::installNavigationFilters()
{
    ui->widgetHome->installEventFilter(this);
    ui->labelHome->installEventFilter(this);

    ui->widgetClients->installEventFilter(this);
    ui->labelClients->installEventFilter(this);

    ui->widgetLogout->installEventFilter(this);
    ui->labelLogout->installEventFilter(this);
}

void AllPages::installProtocolFilters()
{
    installWidgetFilter(ui->widgetFirstProtocol_1);
    installWidgetFilter(ui->widgetSecondProtocol_1);
    installWidgetFilter(ui->widgetLabelProtocol_1);
    installWidgetFilter(ui->labelProtocol_1);
    installWidgetFilter(ui->widgetIconProtocol_1);
    installWidgetFilter(ui->labelIconProtocol_1);

    installWidgetFilter(ui->widgetFirstProtocol_2);
    installWidgetFilter(ui->widgetSecondProtocol_2);
    installWidgetFilter(ui->widgetLabelProtocol_2);
    installWidgetFilter(ui->labelProtocol_2);
    installWidgetFilter(ui->widgetIconProtocol_2);
    installWidgetFilter(ui->labelIconProtocol_2);

    installWidgetFilter(ui->widgetFirstProtocol_3);
    installWidgetFilter(ui->widgetSecondProtocol_3);
    installWidgetFilter(ui->widgetLabelProtocol_3);
    installWidgetFilter(ui->labelProtocol_3);
    installWidgetFilter(ui->widgetIconProtocol_3);
    installWidgetFilter(ui->labelIconProtocol_3);

    installWidgetFilter(ui->widgetFirstProtocol_4);
    installWidgetFilter(ui->widgetSecondProtocol_4);
    installWidgetFilter(ui->widgetLabelProtocol_4);
    installWidgetFilter(ui->labelProtocol_4);
    installWidgetFilter(ui->widgetIconProtocol_4);
    installWidgetFilter(ui->labelIconProtocol_4);

    installWidgetFilter(ui->widgetFirstProtocol_5);
    installWidgetFilter(ui->widgetSecondProtocol_5);
    installWidgetFilter(ui->widgetLabelProtocol_5);
    installWidgetFilter(ui->labelProtocol_5);
    installWidgetFilter(ui->widgetIconProtocol_5);
    installWidgetFilter(ui->labelIconProtocol_5);

    installWidgetFilter(ui->widgetFirstProtocol_6);
    installWidgetFilter(ui->widgetSecondProtocol_6);
    installWidgetFilter(ui->widgetLabelProtocol_6);
    installWidgetFilter(ui->labelProtocol_6);
    installWidgetFilter(ui->widgetIconProtocol_6);
    installWidgetFilter(ui->labelIconProtocol_6);

    installWidgetFilter(ui->widgetFirstProtocol_7);
    installWidgetFilter(ui->widgetSecondProtocol_7);
    installWidgetFilter(ui->widgetLabelProtocol_7);
    installWidgetFilter(ui->labelProtocol_7);
    installWidgetFilter(ui->widgetIconProtocol_7);
    installWidgetFilter(ui->labelIconProtocol_7);

    installWidgetFilter(ui->widgetFirstProtocol_8);
    installWidgetFilter(ui->widgetSecondProtocol_8);
    installWidgetFilter(ui->widgetLabelProtocol_8);
    installWidgetFilter(ui->labelProtocol_8);
    installWidgetFilter(ui->widgetIconProtocol_8);
    installWidgetFilter(ui->labelIconProtocol_8);
}

void AllPages::installWidgetFilter(QWidget* widget)
{
    if (widget) {
        widget->installEventFilter(this);
    }
}

void AllPages::installClientRowFilters()
{
    for (int i = 1; i <= MAX_CLIENTS_PER_PAGE; ++i) {
        QString widgetName = QString("widgetProtocol1_%1").arg(i);
        QWidget* widget = this->findChild<QWidget*>(widgetName);

        if (widget) {
            setupProtocolClientRowFilters(widget);
        }
    }
}

void AllPages::setupProtocolClientRowFilters(QWidget* parentWidget)
{
    if (!parentWidget) return;

    parentWidget->installEventFilter(this);

    for (QLabel* label : parentWidget->findChildren<QLabel*>()) {
        label->installEventFilter(this);
    }

    for (QWidget* widget : parentWidget->findChildren<QWidget*>()) {
        widget->installEventFilter(this);
    }
}

void AllPages::initializeUIState()
{
    ui->stackedWidget->setCurrentWidget(ui->LoginPage);
    ui->errorLoginLabel->hide();
}


void AllPages::attemptLogin(const QString& phone, const QString& password)
{
    try {
        Common::LoginResponse response = userUseCase_->loginUser(
            phone.toStdString(),
            password.toStdString()
            );

        if (response.error) {
            showLoginError(QString::fromStdString(response.errorMessage));
        } else {
            handleSuccessfulLogin(response.user);
        }
    }
    catch (const std::exception& e) {
        showLoginError("Произошла ошибка при входе");
    }
}

void AllPages::handleSuccessfulLogin(std::shared_ptr<Domain::User> user)
{
    ui->errorLoginLabel->clear();
    ui->errorLoginLabel->hide();
    userDoctor_ = user;
    whoPage_ = Pages::Clients;
    loadDashboardWindow();
}

void AllPages::showLoginError(const QString& message)
{
    ui->errorLoginLabel->setText(message);
    ui->errorLoginLabel->show();
}

bool AllPages::validateLoginInput(const QString& phone, const QString& password)
{
    if (phone.trimmed().isEmpty() || password.trimmed().isEmpty()) {
        showLoginError("Пожалуйста, заполните все поля");
        return false;
    }
    return true;
}

void AllPages::logout()
{
    clearSessionData();
    resetUIToLoginState();

}

void AllPages::clearSessionData()
{
    userDoctor_.reset();
    currentClientId_ = 1;
    doctorProtocols_ = Common::ProtocolDashboardResponse();
    loadedDoctorProtocols_ = false;
    protocolMap_.clear();
    currentPage_ = 1;
    totalPages_ = 1;
    protocolTitle_.clear();
}

void AllPages::resetUIToLoginState()
{
    ui->stackedWidget->setCurrentWidget(ui->LoginPage);
    ui->phoneLoginLineEdit->clear();
    ui->passwordLoginLineEdit->clear();
    ui->errorLoginLabel->hide();
    ui->searchLineEdit->clear();
}

void AllPages::loadProtocolsIfNeeded()
{
    if (!loadedDoctorProtocols_) {
        doctorProtocols_ = protocolUseCase_->getAllByDoctorId(userDoctor_->getId());

        for (const auto& doctorProtocol : doctorProtocols_.items) {
            protocolMap_.insert(
                QString::fromStdString(doctorProtocol.protocolTitle),
                doctorProtocol.protocolId
            );
        }

        loadedDoctorProtocols_ = true;
    }
}

void AllPages::updateUserInterface()
{
    if (!userDoctor_) {
        return;
    }
    QString fullName = QString::fromStdString(userDoctor_->getFullName());
    ui->labelUserFullName->setText(fullName);
    ui->labelUserFullName_1->setText(fullName);
    setUserAvatar();
}

Common::ProtocolFormsResponse AllPages::getProtocolIdFormsResponse(
    const Common::PaginationRequest& request,
    int64_t clientId,
    int64_t protocolId)
{
    if (clientId <= 0) {
        throw std::runtime_error("Invalid client ID");
    }

    if (protocolId == -1) {
        throw std::runtime_error("Protocol not found");
    }

    Common::ProtocolFormsResponse response;
    response = protocolUseCase_->getProtocolIdAndClientId(
        request,
        clientId,
        protocolId,
        ""
        );

    return response;
}


void AllPages::clearClientLabels()
{
    clearLabels(getClientFullNameLabels());
    clearLabels(getClientBirthDateLabels());

    for (int i = 1; i <= MAX_CLIENTS_PER_PAGE; ++i) {
        QString widgetName = QString("widgetProtocol1_%1").arg(i);
        QWidget* rowWidget = this->findChild<QWidget*>(widgetName);
        if (!rowWidget) {
            continue;
        }
        rowWidget->setProperty("clientId", 0);
        rowWidget->setProperty("protocolId", 0);
        rowWidget->setProperty("protocolFormId", 0);
        rowWidget->update();
    }
}

void AllPages::clearLabels(const QVector<QLabel*>& labels)
{
    for (QLabel* label : labels) {
        if (label) {
            label->clear();
        }
    }
}

void AllPages::displayProtocols()
{
    QVector<QWidget*> protocolWidgets = getProtocolWidgets();
    QVector<QLabel*> protocolLabels = getProtocolLabels();

    size_t displayCount = utils::calculateDisplayCount(
        protocolWidgets.size(),
        doctorProtocols_.items.size()
    );

    for (size_t i = 0; i < displayCount; ++i) {
        if (protocolWidgets[i] && protocolLabels[i]) {
            protocolLabels[i]->setText(
                QString::fromStdString(doctorProtocols_.items[i].protocolTitle)
                );
            protocolWidgets[i]->setVisible(true);
        }
    }
    loadHomePage();
}

QVector<QWidget*> AllPages::getProtocolWidgets() const
{
    int pageIndex = ui->stackedWidget->indexOf(ui->pechenBlank);
    qDebug() << "Page1 index:" << pageIndex;

    QVector<QWidget*> widgets;
    if (ui->widgetFirstProtocol_1) widgets.push_back(ui->widgetFirstProtocol_1);
    if (ui->widgetFirstProtocol_2) widgets.push_back(ui->widgetFirstProtocol_2);
    if (ui->widgetFirstProtocol_3) widgets.push_back(ui->widgetFirstProtocol_3);
    if (ui->widgetFirstProtocol_4) widgets.push_back(ui->widgetFirstProtocol_4);
    if (ui->widgetFirstProtocol_5) widgets.push_back(ui->widgetFirstProtocol_5);
    if (ui->widgetFirstProtocol_6) widgets.push_back(ui->widgetFirstProtocol_6);
    if (ui->widgetFirstProtocol_7) widgets.push_back(ui->widgetFirstProtocol_7);
    if (ui->widgetFirstProtocol_8) widgets.push_back(ui->widgetFirstProtocol_8);
    return widgets;
}

QVector<QLabel*> AllPages::getProtocolLabels() const
{
    QVector<QLabel*> labels;

    if (ui->labelProtocol_1) {
        ui->labelProtocol_1->setWordWrap(true);
        labels.push_back(ui->labelProtocol_1);
    }

    if (ui->labelProtocol_2) {
        ui->labelProtocol_2->setWordWrap(true);
        labels.push_back(ui->labelProtocol_2);
    }

    if (ui->labelProtocol_3) {
        ui->labelProtocol_3->setWordWrap(true);
        labels.push_back(ui->labelProtocol_3);
    }

    if (ui->labelProtocol_4) {
        ui->labelProtocol_4->setWordWrap(true);
        labels.push_back(ui->labelProtocol_4);
    }

    if (ui->labelProtocol_5) {
        ui->labelProtocol_5->setWordWrap(true);
        labels.push_back(ui->labelProtocol_5);
    }

    if (ui->labelProtocol_6) {
        ui->labelProtocol_6->setWordWrap(true);
        labels.push_back(ui->labelProtocol_6);
    }

    if (ui->labelProtocol_7) {
        ui->labelProtocol_7->setWordWrap(true);
        labels.push_back(ui->labelProtocol_7);
    }

    if (ui->labelProtocol_8) {
        ui->labelProtocol_8->setWordWrap(true);
        labels.push_back(ui->labelProtocol_8);
    }
    return labels;
}

void AllPages::setUserAvatar()
{
    QString iconPath = getAvatarPath();
    QPixmap pix(iconPath);

    if (pix.isNull()) {
        return;
    }

    setScaledPixmap(ui->userLabel_1, pix);
    // setScaledPixmap(ui->userLabel_2, pix);

}

QString AllPages::getAvatarPath() const
{
    if (!userDoctor_) {
        return ":/icons/media/icons/male_doctor.png";
    }
    return (userDoctor_->getGender() == "male")
    ? ":/icons/media/icons/male_doctor.png"
    : ":/icons/media/icons/female_doctor.png";
}

void AllPages::setScaledPixmap(QLabel* label, const QPixmap& pixmap)
{
    if (label) {
        QPixmap scaledPix = pixmap.scaled(
            label->size(),
            Qt::KeepAspectRatio,
            Qt::SmoothTransformation
            );
        label->setPixmap(scaledPix);
    }
}

void AllPages::updatePaginationButtons(bool hasNext, bool hasPrevious)
{
    ui->pushButtonBackClients->setVisible(hasPrevious);
    ui->pushButtonBackClients->setEnabled(hasPrevious);

    ui->pushButtonNextClients->setVisible(hasNext);
    ui->pushButtonNextClients->setEnabled(hasNext);
}

void AllPages::navigateToNextPage()
{
    ++currentPage_;
    refreshCurrentPage();
}

void AllPages::navigateToPreviousPage()
{
    if (currentPage_ > 1) {
        --currentPage_;
        refreshCurrentPage();
    }
}

void AllPages::refreshCurrentPage()
{
    switch (whoPage_) {
    case Pages::Clients:
        clientParts.loadClientsPage();
        break;
    case Pages::Protocol:
        loadProtocolWindow();
        break;
    case Pages::ClinetProtocols:
        protocolParts.loadProtocolsPage();
        break;
    case Pages::ProtocolClient:
        protocolParts.loadProtocolsPage();
        break;
    default:
        break;
    }
}

bool AllPages::eventFilter(QObject* watched, QEvent* event)
{
    // "Yangi shablon" tugmasini tekshirish
    if (event->type() == QEvent::MouseButtonPress) {
        QWidget* widget = qobject_cast<QWidget*>(watched);
        if (widget) {
            QString name = widget->objectName();
            if (name == "widgetAddTemplate" ||
                name == "labelAddTemplatePlus" ||
                name == "labelAddTemplateText") {
                openTemplateBuilder();
                return true;
            }
        }
    }

    if (handleProtocolWidgetClick(watched, event)) return true;

    if (handleClientRowEvents(watched, event)) return true;

    if (handleNavigationEvents(watched, event)) return true;

    return QMainWindow::eventFilter(watched, event);
}

void AllPages::protocolChoseDialog() {
    auto choseDialog = new ProtocolChose(this, this);
    choseDialog->setAttribute(Qt::WA_DeleteOnClose);
    choseDialog->show();
}

void AllPages::openTemplateBuilder(int64_t templateId) {
    auto builder = new TemplateBuilder(this, this, templateId);
    builder->setAttribute(Qt::WA_DeleteOnClose);
    builder->exec();
}

void AllPages::updateButtonsForId() {
    for (int i = 1; i <= MAX_CLIENTS_PER_PAGE; ++i) {
        QString widgetName = QString("widgetProtocol1_%1").arg(i);
        QWidget* parentWidget = findChild<QWidget*>(widgetName);

        QString addButtonName = QString("pushButton_ClientAddProtocol_%1").arg(i);
        QString editButtonName = QString("pushButtonClientEdit_%1").arg(i);
        QString viewButtonName = QString("pushButton_ClientProtocolView_%1").arg(i);

        QPushButton* addButton = findChild<QPushButton*>(addButtonName);
        QPushButton* editButton = findChild<QPushButton*>(editButtonName);
        QPushButton* viewButton = findChild<QPushButton*>(viewButtonName);
        if (whoPage_ == Pages::Clients || whoPage_ == Pages::Protocol) {
            if(parentWidget->property("clientId").toLongLong() == 0) {
                addButton->setVisible(false);
                addButton->setEnabled(false);

                editButton->setVisible(false);
                editButton->setEnabled(false);

                viewButton->setVisible(false);
                viewButton->setEnabled(false);
            } else {
                addButton->setVisible(true);
                addButton->setEnabled(true);

                editButton->setVisible(true);
                editButton->setEnabled(true);

                viewButton->setVisible(true);
                viewButton->setEnabled(true);
            }
        } else if(whoPage_ == Pages::ClinetProtocols || whoPage_ == Pages::ProtocolClient) {
            if((parentWidget->property("protocolFormId").toLongLong() == 0) && (parentWidget->property("protocolId").toLongLong() == 0)) {
                addButton->setVisible(false);
                addButton->setEnabled(false);

                editButton->setVisible(false);
                editButton->setEnabled(false);

                viewButton->setVisible(false);
                viewButton->setEnabled(false);
            } else {
                addButton->setVisible(false);
                addButton->setEnabled(false);

                editButton->setVisible(false);
                editButton->setEnabled(false);

                viewButton->setVisible(true);
                viewButton->setEnabled(true);
            }
        }
    }
}


bool AllPages::handleClientRowEvents(QObject* watched, QEvent* event)
{
    for (int i = 1; i <= MAX_CLIENTS_PER_PAGE; ++i) {

        QString widgetName = QString("widgetProtocol1_%1").arg(i);
        QWidget* parentWidget = findChild<QWidget*>(widgetName);
        if (!parentWidget) continue;

        if (watched == parentWidget || parentWidget->isAncestorOf(qobject_cast<QWidget*>(watched))) {
            if (event->type() == QEvent::MouseButtonPress) {
                QPushButton* clickedButton = qobject_cast<QPushButton*>(watched);
                // && hasValidClientId(parentWidget)
                if (clickedButton) {
                    QString buttonName = clickedButton->objectName();
                    if(buttonName == QString("pushButton_ClientAddProtocol_%1").arg(i)) {
                        if(whoPage_ == Pages::Clients) {
                            currentClientId_ = parentWidget->property("clientId").toLongLong();
                            protocolChoseDialog();
                            return true;
                        } else if(whoPage_ == Pages::Protocol) {
                            currentClientId_ = parentWidget->property("clientId").toLongLong();
                            protocolChoseDialog();
                            return true;
                        }
                    } else if(buttonName == QString("pushButtonClientEdit_%1").arg(i)) {
                        if(whoPage_ == Pages::Clients || whoPage_ == Pages::Protocol) {
                            currentClientId_ = parentWidget->property("clientId").toLongLong();
                            auto client = clientUseCase_->getClientById(currentClientId_);
                            updateClient_(client);
                        } else if(whoPage_ == Pages::ClinetProtocols || whoPage_ == Pages::ProtocolClient) {

                        }
                        return true;
                    } else if (buttonName == QString("pushButton_ClientProtocolView_%1").arg(i)) {
                        if (whoPage_ == Pages::Clients) {
                            currentPage_ = 1;
                            currentClientId_ = parentWidget->property("clientId").toLongLong();
                            whoPage_ = Pages::ClinetProtocols;
                        } else if (whoPage_ == Pages::Protocol) {
                            currentPage_ = 1;
                            currentClientId_ = parentWidget->property("clientId").toLongLong();
                            whoPage_ = Pages::ProtocolClient;
                        } else if (whoPage_ == Pages::ProtocolClient || whoPage_==Pages::ClinetProtocols) {
                            currentProtocolFormId_ = parentWidget->property("protocolFormId").toLongLong();
                            currentProtocolId_ = parentWidget->property("protocolId").toLongLong();

                            QString labelName = QString("labelProtocol1FullName_%1").arg(i);
                            QLabel *label = parentWidget->findChild<QLabel*>(labelName);
                            protocolTitle_ = label->text().trimmed();

                            protocolForms.diplayClientProtoclForm();
                            return true;
                        }
                        protocolParts.loadProtocolsPage();
                        return true;
                    }
                }
                return false;
            }
        }
    }
    return false;
}

bool AllPages::hasValidClientId(QWidget* widget) const
{
    if (!widget) {
        return false;
    }

    QVariant clientIdProperty = widget->property("clientId");
    QVariant protocolIdProperty = widget->property("protocolId");

    if (!clientIdProperty.isValid() && !protocolIdProperty.isValid()) {
        return false;
    }
    qlonglong clientId = clientIdProperty.toLongLong();
    qlonglong protocolId = protocolIdProperty.toLongLong();
    if (clientId <= 0 && protocolId <= 0) {
        return false;
    }
    return true;
}

bool AllPages::handleProtocolWidgetClick(QObject* watched, QEvent* event)
{
    if (event->type() == QEvent::MouseButtonPress && isProtocolWidget(watched)) {
        whoPage_ = Pages::Protocol;
        loadProtocolWindow();
        return true;
    }
    return false;
}

bool AllPages::handleNavigationEvents(QObject* watched, QEvent* event)
{
    if (handleHomeNavigation(watched, event)) return true;
    if (clientParts.handleClientsNavigation(watched, event)) return true;
    if (handleLogoutNavigation(watched, event)) return true;

    return false;
}

bool AllPages::handleHomeNavigation(QObject* watched, QEvent* event)
{
    if (watched == ui->widgetHome || watched == ui->labelHome) {
        if (event->type() == QEvent::Enter) {
            setHomeStyle(true);
        }
        else if (event->type() == QEvent::Leave) {
            setHomeStyle(false);
        }
        else if (event->type() == QEvent::MouseButtonPress) {
            whoPage_ = Pages::Dashboard;
            loadHomePage();
            return true;
        }
    }
    return false;
}

void AllPages::setHomeStyle(bool isHovered)
{
    if (isHovered) {
        ui->widgetHome->setStyleSheet("background-color: #FFFFFF; border-radius: 10px;");
        ui->labelHome->setStyleSheet("background-color: #FFFFFF; image:url(:/icons/media/icons/home_2.png);");
    } else {
        ui->widgetHome->setStyleSheet("background-color: #69DFD9; border-radius: 10px;");
        ui->labelHome->setStyleSheet("background-color: #69DFD9; image:url(:/icons/media/icons/home_1.png);");
    }
}


bool AllPages::handleLogoutNavigation(QObject* watched, QEvent* event)
{
    if (watched == ui->widgetLogout || watched == ui->labelLogout) {
        if (event->type() == QEvent::Enter) {
            setLogoutStyle(true);
        }
        else if (event->type() == QEvent::Leave) {
            setLogoutStyle(false);
        }
        else if (event->type() == QEvent::MouseButtonPress) {
            logout();
            return true;
        }
    }
    return false;
}

void AllPages::setLogoutStyle(bool isHovered)
{
    if (isHovered) {
        ui->widgetLogout->setStyleSheet("background-color: #FFFFFF; border-radius: 10px;");
        ui->labelLogout->setStyleSheet("background-color: #FFFFFF; image:url(:/icons/media/icons/outpatient_2.png);");
    } else {
        ui->widgetLogout->setStyleSheet("background-color: #69DFD9; border-radius: 10px;");
        ui->labelLogout->setStyleSheet("background-color: #69DFD9; image:url(:/icons/media/icons/outpatient_1.png);");
    }
}

void AllPages::handleProtocolRowHover(QWidget* parentWidget, bool isEntering)
{
    applyHoverProperty(parentWidget, isEntering);
    applyHoverToChildren<QLabel>(parentWidget, isEntering);
    applyHoverToChildren<QWidget>(parentWidget, isEntering);
}

void AllPages::applyHoverProperty(QWidget* widget, bool isHovered)
{
    widget->setProperty("hovered", isHovered);
    widget->style()->unpolish(widget);
    widget->style()->polish(widget);
}

template<typename T>
void AllPages::applyHoverToChildren(QWidget* parent, bool isHovered)
{
    QList<T*> children = parent->findChildren<T*>();
    for (T* child : children) {
        child->setProperty("hovered", isHovered);
        child->style()->unpolish(child);
        child->style()->polish(child);
    }
}


bool AllPages::isProtocolWidget(QObject* watched)
{
    if (isProtocol1Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_1->text().trimmed();
        return true;
    }
    else if (isProtocol2Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_2->text().trimmed();
        return true;
    }

    else if (isProtocol3Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_3->text().trimmed();
        return true;
    }

    else if (isProtocol4Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_4->text().trimmed();
        return true;
    }

    else if (isProtocol5Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_5->text().trimmed();
        return true;
    }

    else if (isProtocol6Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_6->text().trimmed();
        return true;
    }

    else if (isProtocol7Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_7->text().trimmed();
        return true;
    }

    else if (isProtocol8Widget(watched)) {
        protocolTitle_ = ui->labelProtocol_8->text().trimmed();
        return true;
    }

    return false;
}



bool AllPages::isProtocol1Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_1
            || watched == ui->widgetSecondProtocol_1
            || watched == ui->widgetLabelProtocol_1
            || watched == ui->labelProtocol_1
            || watched == ui->widgetIconProtocol_1
            || watched == ui->labelIconProtocol_1);
}

bool AllPages::isProtocol2Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_2
            || watched == ui->widgetSecondProtocol_2
            || watched == ui->widgetLabelProtocol_2
            || watched == ui->labelProtocol_2
            || watched == ui->widgetIconProtocol_2
            || watched == ui->labelIconProtocol_2);
}

bool AllPages::isProtocol3Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_3
            || watched == ui->widgetSecondProtocol_3
            || watched == ui->widgetLabelProtocol_3
            || watched == ui->labelProtocol_3
            || watched == ui->widgetIconProtocol_3
            || watched == ui->labelIconProtocol_3);
}

bool AllPages::isProtocol4Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_4
            || watched == ui->widgetSecondProtocol_4
            || watched == ui->widgetLabelProtocol_4
            || watched == ui->labelProtocol_4
            || watched == ui->widgetIconProtocol_4
            || watched == ui->labelIconProtocol_4);
}

bool AllPages::isProtocol5Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_5
            || watched == ui->widgetSecondProtocol_5
            || watched == ui->widgetLabelProtocol_5
            || watched == ui->labelProtocol_5
            || watched == ui->widgetIconProtocol_5
            || watched == ui->labelIconProtocol_5);
}

bool AllPages::isProtocol6Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_6
            || watched == ui->widgetSecondProtocol_6
            || watched == ui->widgetLabelProtocol_6
            || watched == ui->labelProtocol_6
            || watched == ui->widgetIconProtocol_6
            || watched == ui->labelIconProtocol_6);
}

bool AllPages::isProtocol7Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_7
            || watched == ui->widgetSecondProtocol_7
            || watched == ui->widgetLabelProtocol_7
            || watched == ui->labelProtocol_7
            || watched == ui->widgetIconProtocol_7
            || watched == ui->labelIconProtocol_7);
}


bool AllPages::isProtocol8Widget(QObject* watched) const
{
    return (watched == ui->widgetFirstProtocol_8
            || watched == ui->widgetSecondProtocol_8
            || watched == ui->widgetLabelProtocol_8
            || watched == ui->labelProtocol_8
            || watched == ui->widgetIconProtocol_8
            || watched == ui->labelIconProtocol_8);
}


QVector<QLabel*> AllPages::getClientFullNameLabels() const
{
    return {
        ui->labelProtocol1FullName_1, ui->labelProtocol1FullName_2, ui->labelProtocol1FullName_3,
        ui->labelProtocol1FullName_4, ui->labelProtocol1FullName_5, ui->labelProtocol1FullName_6,
        ui->labelProtocol1FullName_7, ui->labelProtocol1FullName_8, ui->labelProtocol1FullName_9,
        ui->labelProtocol1FullName_10
    };
}

QVector<QLabel*> AllPages::getClientBirthDateLabels() const
{
    return {
        ui->labelProtocol1BirthDate_1, ui->labelProtocol1BirthDate_2, ui->labelProtocol1BirthDate_3,
        ui->labelProtocol1BirthDate_4, ui->labelProtocol1BirthDate_5, ui->labelProtocol1BirthDate_6,
        ui->labelProtocol1BirthDate_7, ui->labelProtocol1BirthDate_8, ui->labelProtocol1BirthDate_9,
        ui->labelProtocol1BirthDate_10
    };
}

void AllPages::showError(const QString& title, const QString& message)
{
    QMessageBox::warning(this, title, message);
}

void AllPages::loadHomePage()
{
    ui->stackedWidget_2->setCurrentWidget(ui->page_Dashboard_home);
    ui->searchLineEdit->clear();
}


void AllPages::loadDashboardWindow()
{
    if (!userDoctor_) {
        showError("Ошибка", "Данные пользователя не найдены");
        return;
    }

    try {
        loadProtocolsIfNeeded();
        updateUserInterface();
        displayProtocols();
        clientParts.loadClientsPage();

        ui->stackedWidget->setCurrentWidget(ui->DashboardPage);

    }
    catch (const std::exception& e) {
        showError("Ошибка", "Не удалось загрузить данные");
    }
}


void AllPages::loadProtocolWindow()
{
    if (protocolTitle_.isEmpty()) {
        return;
    }

    currentProtocolId_ = protocolMap_.value(protocolTitle_, -1);
    if (currentProtocolId_ == -1) {
        showError("Ошибка", "Протокол не найден");
        return;
    }

    ui->PAGE->setText(protocolTitle_);

    try {
        Common::PaginationRequest request;
        request.page = currentPage_;

        QString searchQuery = ui->searchLineEdit->text().trimmed();
        Common::PaginationResponse<Domain::Client> clients =
            clientUseCase_->getAllClientByProtocolId(
                request,
                currentProtocolId_,
                searchQuery.toUtf8().toStdString()
            );
        clientParts.displayClients(clients);
    }
    catch (const std::exception& e) {
        showError("Ошибка", "Не удалось загрузить пациентов");
    }
}

// void AllPages::loadClientPageProtocolIdSearchDate(QString date) {
//     if (currentClientId_ <= 0) {
//         showError("Ошибка", "Неверный ID пациента");
//         return;
//     }

//     try {
//         Common::PaginationRequest request;
//         int64_t protocolId = protocolMap_.value(protocolTitle_, -1);
//         Common::ProtocolFormsResponse response =
//             protocolUseCase_->getProtocolIdAndClientId(
//                 request,
//                 currentClientId_,
//                 protocolId,
//                 date.toUtf8().toStdString()
//                 );
//         // displayProtoclAndClientId(response);

//     }
//     catch (const std::exception& e) {
//         showError("Ошибка", "Не удалось загрузить данные пациента");
//     }
// }

void AllPages::loadClientPageProtocolId(int64_t clientId, int64_t protocolId)
{
    if (clientId <= 0) {
        showError("Ошибка", "Неверный ID пациента");
        return;
    }

    try {
        auto client = clientUseCase_->getClientById(clientId);
        if (!client) {
            showError("Ошибка", "Пациент не найден");
            return;
        }
        currentClientId_ = clientId;

        Common::PaginationRequest request;
        request.page = currentPage_;

        Common::ProtocolFormsResponse response =
            protocolUseCase_->getProtocolIdAndClientId(
                request,
                clientId,
                protocolId
                );

        ui->PAGE->setText(QString::fromStdString(client->getFullName()));
        // displayProtoclAndClientId(response);

    }
    catch (const std::exception& e) {
        showError("Ошибка", "Не удалось загрузить данные пациента");
    }
}


void AllPages::on_loginPushButton_clicked()
{
    QString phone = ui->phoneLoginLineEdit->text();
    QString password = ui->passwordLoginLineEdit->text();

    if (!validateLoginInput(phone, password)) {
        return;
    }

    attemptLogin(phone, password);
}


void AllPages::on_pushButtonNextClients_clicked()
{
    ui->pushButtonNextClients->clearFocus();

    int previousPage = currentPage_;
    navigateToNextPage();

    if (currentPage_ != previousPage + 1) {
        currentPage_ = previousPage;
    }
}


void AllPages::on_pushButtonBackClients_clicked()
{
    ui->pushButtonBackClients->clearFocus();

    int previousPage = currentPage_;
    navigateToPreviousPage();

    if (currentPage_ != previousPage - 1) {
        currentPage_ = previousPage;
    }
}


void AllPages::on_pushButtonSearch_clicked()
{
    if(whoPage_ == Pages::Protocol || whoPage_ == Pages::Clients) {
        ui->searchLineEdit->setVisible(true);
        ui->searchLineEdit->setEnabled(true);
        ui->pushButtonSearch->setVisible(false);
        ui->pushButtonSearch->setEnabled(false);
    } else if(whoPage_ == Pages::ProtocolClient) {
        auto calendarDialog = new SearchCalendarDilalog(this, this);
        calendarDialog->setAttribute(Qt::WA_DeleteOnClose);
        calendarDialog->exec();
    } else if(whoPage_ == Pages::ClinetProtocols) {
        auto protocolDialog = new ProtocolChose(this, this);
        protocolDialog->setAttribute(Qt::WA_DeleteOnClose);
        protocolDialog->exec();
    }
}

void AllPages::on_pushButtonCreateClient_clicked()
{
    ClientCreater = new ClientForm(this, this);
    ClientCreater->setAttribute(Qt::WA_DeleteOnClose);
    ClientCreater->setWindowModality(Qt::ApplicationModal);
    ClientCreater->show();
}

void AllPages::updateClient_(std::shared_ptr<Domain::Client> client)
{
    ClientCreater = new ClientForm(this, this, client);
    ClientCreater->setAttribute(Qt::WA_DeleteOnClose);
    ClientCreater->setWindowModality(Qt::ApplicationModal);
    ClientCreater->show();
}


void AllPages::on_pushButtonSaveProtocol_clicked()
{
    protocolForms.pushButtonSaveProtocol();
}

void AllPages::on_pushButtonShow_clicked()
{
    if (currentClientId_ <= 0 || currentProtocolId_ <= 0 || currentProtocolFormId_ <= 0) {
        showError("Ошибка", "Выберите клиента и протокол");
        return;
    }
    if (!userDoctor_) {
        showError("Ошибка", "Данные врача не найдены");
        return;
    }
    protocolForms.diplayClientProtoclForm();
}


void AllPages::on_pushButtonSave_sh_clicked()
{
    protocolForms.pushButtonSaveProtocol_sh();
}

void AllPages::on_pushButtonSaveProtocolSelezenki_clicked()
{
    protocolForms.pushButtonSaveProtocol_Selezenki();
}

void AllPages::on_KolloniSustavSaveButton_clicked()
{
    protocolForms.pushButtonSaveProtocol_KolloniSustav();
}

void AllPages::on_NadpochechnikiSaveButton_clicked()
{
    protocolForms.pushButtonSaveProtocol_Nadpochechniki();
}

void AllPages::on_pushButtonSaveProtocolTremestBer_clicked()
{
    protocolForms.pushButtonSaveProtocol_TremestrBer();
}

void AllPages::on_FollikSaveButton_clicked()
{
    protocolForms.pushButtonSaveProtocol_Follik();
}

void AllPages::on_pechenBlankSavePushButton_clicked()
{
    protocolForms.pushButtonSaveProtocol_PechenBlank();
}

void AllPages::on_MaliySaveButton_clicked()
{
    protocolForms.pushButtonSaveProtocol_MaliyTazBlank();
}

void AllPages::on_PochkiSaveButton_clicked()
{
    protocolForms.pushButtonSaveProtocol_PochkiBlank();
}

void AllPages::on_MalochniySaveButton_clicked()
{
    protocolForms.pushButtonSaveProtocol_MalochniyJelBlank();
}


void AllPages::on_PochkiSaveButton_2_clicked()
{
    protocolForms.pushButtonSaveProtocol_podjeludochBlank();
}

void AllPages::saveComboBoxItems()
{
    QJsonObject root;

    // Barcha comboBoxlarni topamiz
    const auto comboBoxes = this->findChildren<QComboBox*>();
    for (QComboBox* comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QJsonArray items;
        for (int i = 0; i < comboBox->count(); ++i)
            items.append(comboBox->itemText(i));
        root[key] = items;
    }

    QJsonDocument doc(root);

    QFile file("comboBoxItems.json");
    if (file.open(QIODevice::WriteOnly)) {
        file.write(doc.toJson());
        file.close();
        qDebug() << "✅ ComboBox itemlari saqlandi";
    }
}


void AllPages::loadComboBoxItems()
{
    QFile file("comboBoxItems.json");
    if (!file.exists()) return;

    if (file.open(QIODevice::ReadOnly)) {
        QJsonDocument doc = QJsonDocument::fromJson(file.readAll());
        QJsonObject root = doc.object();

        const auto comboBoxes = this->findChildren<QComboBox*>();
        for (QComboBox* comboBox : comboBoxes)
        {
            QString key = comboBox->objectName();
            if (root.contains(key)) {
                comboBox->clear();
                QJsonArray items = root[key].toArray();
                for (const QJsonValue &val : items)
                    comboBox->addItem(val.toString());
            }
        }

        file.close();
        qDebug() << "✅ ComboBox itemlari yuklandi";
    }
}








