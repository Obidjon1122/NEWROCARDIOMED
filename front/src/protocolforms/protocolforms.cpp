#include "protocolforms.h"
#include <QPrinter>
#include <QPrintDialog>
#include <QPrinterInfo>
#include <QAbstractPrintDialog>
#include <QPdfDocument>
#include <QPainter>
#include <QEventLoop>
#include <QTimer>
#include <QMessageBox>
#include "../../allpages.h"
#include "../../ui_allpages.h"
#include "../utils.h"

ProtocolForms::ProtocolForms(AllPages* parent)
    :parent_(parent)
{
}

Ui::AllPages* ProtocolForms::ui()
{
    return parent_->ui;
}


void ProtocolForms::diplayClientProtoclForm()
{
    if (parent_->currentProtocolFormId_ <= 0) {
        qDebug() << "Protocol form ID xato!";
        return;
    }

    QMap<QString, QString> clientProtocolForm =
        parent_->protocolUseCase_->getProtoclFormByClientIdProtocolId(
            parent_->currentProtocolFormId_,
            parent_->currentClientId_,
            parent_->userDoctor_ ? parent_->userDoctor_->getId() : 0
        );
    if (clientProtocolForm.isEmpty()) {
        qDebug() << "Protokol topilmadi yoki bo'sh!";
        return;
    }

    auto client = parent_->clientUseCase_->getClientById(parent_->currentClientId_);
    if (!client) {
        qDebug() << "Klient topilmadi!";
        return;
    }

    if (!parent_->userDoctor_) {
        qDebug() << "Doktor ma'lumotlari topilmadi!";
        return;
    }

    const QString year = utils::extractYear(clientProtocolForm["date"]);
    clientProtocolForm["fio"] = QString::fromStdString(client->getFullName());
    clientProtocolForm["gender"] = (client->getGender() == "male") ? "Мужской" : "Женский";
    clientProtocolForm["birth_year"] = QString::fromStdString(client->getBirthDate());
    clientProtocolForm["date"] = utils::formatDateToRussian(clientProtocolForm["date"]);
    clientProtocolForm["year"] = year;
    clientProtocolForm["vrach"] = QString::fromStdString(parent_->userDoctor_->getFullName());
    clientProtocolForm["telefon"] = QString::fromStdString(parent_->userDoctor_->getPhone());
    // /icons/media/icons/home_1.png
    QMap<int64_t, QString> cur_pro = {
        {1, R"(:/icons/media/protocolforms/Mashonka/index.html)"},
        {2, R"(:/icons/media/protocolforms/Shitavitka/index.html)"},
        {3, R"(:/icons/media/protocolforms/Cелезенка/index.html)"},
        {4, R"(:/icons/media/protocolforms/Коленный_сустав/index.html)"},
        {5, R"(:/icons/media/protocolforms/Надпочечники/index.html)"},
        {6, R"(:/icons/media/protocolforms/Первый_триместр/index.html)"},
        {7, R"(:/icons/media/protocolforms/Фолликулометрия/index.html)"},
        {8, R"(:/icons/media/protocolforms/Печеньбланк/index.html)"},
        {9, R"(:/icons/media/protocolforms/Почкибланк/index.html)"},
        {11, R"(:/icons/media/protocolforms/Молочные_железы_бланк/index.html)"},
        {12, R"(:/icons/media/protocolforms/Плод_бланк/index.html)"},
        {13, R"(:/icons/media/protocolforms/Поджелудочная/index.html)"},
        {14, R"(:/icons/media/protocolforms/Простата/index.html)"},
        {10, R"(:/icons/media/protocolforms/Малый_таз_бланк/index.html)"},

        // {1, R"(C:\Projects\NEVROCARDIOMED\front\media\protocolforms\Mashonka\index.html)"},
        // {2, R"(C:\Projects\NEVROCARDIOMED\front\media\protocolforms\Shitavitka\index.html)"}
    };

    QString templatePath = cur_pro.value(parent_->currentProtocolId_, "");
    if (templatePath.isEmpty()) {
        qDebug() << "Template topilmadi! Protocol ID:" << parent_->currentProtocolId_;
        return;
    }
    QString filledHtml = fillHtmlTemplate(templatePath, clientProtocolForm);
    if (filledHtml.isEmpty()) {
        qDebug() << "HTML to'ldirib bo'lmadi!";
        return;
    }

    QString tempDir = QDir::tempPath() + "/nevrocardio_temp/";
    QDir().mkpath(tempDir);

    QString tempHtmlPath = tempDir + QString("protocol_%1.html").arg(parent_->currentProtocolFormId_);

    QFile outputHtml(tempHtmlPath);
    if (!outputHtml.open(QIODevice::WriteOnly | QIODevice::Text)) {
        qDebug() << "HTML faylni yozib bo‘lmadi:" << tempHtmlPath;
        return;
    }

    QTextStream out(&outputHtml);
    out << filledHtml;
    outputHtml.close();
    qDebug() << "To‘ldirilgan HTML vaqtincha saqlandi:" << tempHtmlPath;

    QDialog *htmlDialog = new QDialog(nullptr);
    htmlDialog->setWindowTitle("🧾 To‘ldirilgan Protokol (Preview)");

    htmlDialog->resize(740, 1160);

    auto *mainLayout = new QVBoxLayout(htmlDialog);

    auto *webView = new QWebEngineView(htmlDialog);
    webView->load(QUrl::fromLocalFile(tempHtmlPath));
    webView->setZoomFactor(1.2);
    mainLayout->addWidget(webView);

    auto *buttonLayout = new QHBoxLayout();
    QPushButton *editButton = new QPushButton("Редактировать", htmlDialog);
    QPushButton *downloadPdfButton = new QPushButton("Скачать PDF", htmlDialog);
    QPushButton *printButton = new QPushButton("Печать", htmlDialog);

    QString buttonStyle = R"(
        QPushButton {
            border: 2px solid #D1D1D1;
            border-radius: 10px;
            background: transparent;
            color: #333333;
            padding: 6px 18px;
            font-size: 14px;
            font-weight: bold;
        }
        QPushButton:hover {
            background-color: #F2F2F2;
            border-color: #BEBEBE;
        }
        QPushButton:pressed {
            background-color: #69DFD9;
            border-color: #3CCFC6;
            color: white;
        }
    )";

    QObject::connect(editButton, &QPushButton::clicked, [=]() {
        editProtocoleForm(clientProtocolForm);
        htmlDialog->close();
    });

    editButton->setStyleSheet(buttonStyle);
    downloadPdfButton->setStyleSheet(buttonStyle);
    printButton->setStyleSheet(buttonStyle);

    buttonLayout->addWidget(editButton);
    buttonLayout->addWidget(downloadPdfButton);
    buttonLayout->addWidget(printButton);

    buttonLayout->setSpacing(15);
    buttonLayout->setContentsMargins(10, 10, 10, 10);
    mainLayout->addLayout(buttonLayout);

    htmlDialog->setLayout(mainLayout);
    // htmlDialog->setWindowModality(Qt::ApplicationModal);
    htmlDialog->setWindowFlag(Qt::WindowStaysOnTopHint);
    htmlDialog->show();

    QObject::connect(downloadPdfButton, &QPushButton::clicked, htmlDialog,
                     [this, tempHtmlPath, htmlDialog]() {
                         QString defaultPath;
                         if (!lastPdfSavePath.isEmpty()) {
                            defaultPath = lastPdfSavePath;
                         } else {
                            defaultPath = QDir::homePath() + "/protocol.pdf";
                         }

                         QString savePath = QFileDialog::getSaveFileName(
                             htmlDialog,
                             "Сохранить PDF",
                             defaultPath,
                             "Файлы PDF (*.pdf)"
                             );

                         if (savePath.isEmpty()) return;

                         this->convertHtmlToPdf(tempHtmlPath, savePath);

                         lastPdfSavePath = savePath;

                         qDebug() << "✅ PDF saqlandi:" << savePath;
                     });

    QObject::connect(printButton, &QPushButton::clicked, htmlDialog,
                     [this, tempHtmlPath, htmlDialog]() {
                         // 1. HTML ni PDF ga o'tkazish (160% zoom bilan)
                         QString tempPdfPath = QDir::tempPath() + "/nevrocardio_temp/temp_print.pdf";
                         QDir().mkpath(QDir::tempPath() + "/nevrocardio_temp/");

                         // Mavjud convertHtmlToPdf funksiyasidan foydalanish
                         this->convertHtmlToPdf(tempHtmlPath, tempPdfPath);

                         // PDF yaratilishini kutish va keyin printer dialogini ochish
                         QTimer::singleShot(4000, htmlDialog, [=]() {
                             if (!QFile::exists(tempPdfPath)) {
                                 QMessageBox::warning(htmlDialog, "Ошибка",
                                                      "Не удалось создать PDF для печати!");
                                 return;
                             }

                             qDebug() << "✅ PDF yaratildi, printer dialog ochilmoqda...";

                             // 2. Printerlarni tekshirish
                             QList<QPrinterInfo> printers = QPrinterInfo::availablePrinters();

                             if (printers.isEmpty()) {
                                 QMessageBox::warning(htmlDialog, "Ошибка",
                                                      "В системе не найдено ни одного принтера!");
                                 QFile::remove(tempPdfPath);
                                 return;
                             }

                             // 3. Printer dialogini ochish
                             QPrinter printer(QPrinter::HighResolution);
                             printer.setPageOrientation(QPageLayout::Portrait);
                             printer.setPageSize(QPageSize(QPageSize::A4));

                             QPrintDialog printDialog(&printer, htmlDialog);
                             printDialog.setWindowTitle("Выберите принтер");
                             printDialog.setOption(QAbstractPrintDialog::PrintToFile, true);

                             if (printDialog.exec() == QDialog::Accepted) {
                                 qDebug() << "Tanlangan printer:" << printer.printerName();

                                 // 4. PDF ni printerga yuborish
                                 QPdfDocument pdfDoc;
                                 pdfDoc.load(tempPdfPath);

                                 QEventLoop docLoop;
                                 QObject::connect(&pdfDoc, &QPdfDocument::statusChanged,
                                                  &docLoop, [&](QPdfDocument::Status status) {
                                                      if (status == QPdfDocument::Status::Ready ||
                                                          status == QPdfDocument::Status::Error) {
                                                          docLoop.quit();
                                                      }
                                                  });

                                 QTimer::singleShot(2000, &docLoop, &QEventLoop::quit);
                                 docLoop.exec();

                                 if (pdfDoc.status() == QPdfDocument::Status::Ready) {
                                     QPainter painter;
                                     if (!painter.begin(&printer)) {
                                         QMessageBox::warning(htmlDialog, "Ошибка",
                                                              "Не удалось подключиться к принтеру!");
                                         QFile::remove(tempPdfPath);
                                         return;
                                     }

                                     QPageLayout pageLayout = printer.pageLayout();
                                     QRectF pageRect = pageLayout.paintRectPixels(printer.resolution());

                                     for (int i = 0; i < pdfDoc.pageCount(); ++i) {
                                         if (i > 0) {
                                             printer.newPage();
                                         }

                                         QImage pageImage = pdfDoc.render(i, pageRect.size().toSize());
                                         painter.drawImage(0, 0, pageImage);
                                     }

                                     painter.end();
                                     qDebug() << "✅ Hujjat printerga yuborildi!";

                                     QMessageBox::information(htmlDialog, "Успех",
                                                              "Документ отправлен на печать!");
                                 } else {
                                     QMessageBox::warning(htmlDialog, "Ошибка",
                                                          "Не удалось прочитать PDF!");
                                 }
                             } else {
                                 qDebug() << "Print bekor qilindi";
                             }

                             // 5. Vaqtinchalik PDF faylni o'chirish
                             QFile::remove(tempPdfPath);
                             qDebug() << "🗑️ Vaqtinchalik PDF o'chirildi";
                         });
                     });

    QObject::connect(htmlDialog, &QDialog::finished, htmlDialog, [tempHtmlPath]() {
        QFile::remove(tempHtmlPath);
        qDebug() << "Vaqtinchalik HTML o‘chirildi:" << tempHtmlPath;
    });

    qDebug() << "To‘ldirilgan HTML dialogda ko‘rsatildi (120% zoom bilan).";
}

QString ProtocolForms::fillHtmlTemplate(const QString &templatePath, const QMap<QString, QString> &values)
{
    QFile file(templatePath);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        qDebug() << "HTML faylni ochib bo‘lmadi:" << templatePath;
        return "";
    }

    QTextStream in(&file);
    QString html = in.readAll();
    file.close();

    for (auto it = values.constBegin(); it != values.constEnd(); ++it) {
        const QString key = it.key();
        const QString placeholder = "{{ " + key + " }}";
        html.replace(placeholder, it.value(), Qt::CaseSensitive);
    }

    return html;
}

void ProtocolForms::convertHtmlToPdf(const QString &inputHtmlPath, const QString &outputPdfPath)
{
    qDebug() << "=== PDF KONVERTATSIYA BOSHLANDI ===";
    qDebug() << "HTML fayl:" << inputHtmlPath;
    qDebug() << "PDF fayl:" << outputPdfPath;
    qDebug() << "QtWebEngineProcess mavjudmi?"
             << QFile::exists(QCoreApplication::applicationDirPath() + "/QtWebEngineProcess.exe");
    qDebug() << "Resources mavjudmi?"
             << QDir(QCoreApplication::applicationDirPath() + "/resources").exists();

    if (!QFileInfo::exists(inputHtmlPath)) {
        qDebug() << "❌ HTML fayl topilmadi!";
        return;
    }

    QDir().mkpath(QFileInfo(outputPdfPath).absolutePath());

    // ⭐ QWebEngineView ishlatish (QWebEnginePage o'rniga) ⭐
    QWebEngineView *webView = new QWebEngineView();
    webView->setAttribute(Qt::WA_DeleteOnClose);
    webView->resize(794, 1123); // A4 o'lchami

    qDebug() << "WebView yaratildi, HTML yuklanmoqda...";

    QObject::connect(webView->page(), &QWebEnginePage::loadFinished, webView, [=](bool ok) {
        qDebug() << "loadFinished signal keldi, OK =" << ok;

        if (!ok) {
            qDebug() << "❌ HTML yuklanmadi!";
            webView->deleteLater();
            return;
        }

        qDebug() << "✅ HTML yuklandi, zoom qo'llanmoqda...";
        webView->page()->runJavaScript("document.body.style.zoom='160%';");

        QTimer::singleShot(2000, webView, [=]() { // 2 soniya kutish
            qDebug() << "📄 printToPdf() chaqirilmoqda...";

            QPageLayout layout(
                QPageSize(QPageSize::A4),
                QPageLayout::Portrait,
                QMarginsF(0, 0, 0, 0),
                QPageLayout::Millimeter
                );

            QPageRanges range;
            range.addRange(1, 1);

            webView->page()->printToPdf(outputPdfPath, layout, range);
            qDebug() << "printToPdf() chaqirildi, natija kutilmoqda...";
        });
    });

    QObject::connect(webView->page(), &QWebEnginePage::pdfPrintingFinished, webView,
                     [=](const QString &path, bool success) {
                         qDebug() << "=== PDF PRINTING FINISHED SIGNAL ===";
                         qDebug() << "Path:" << path;
                         qDebug() << "Success:" << success;

                         if (success) {
                             qDebug() << "✅ PDF MUVAFFAQIYATLI YARATILDI!";
                         } else {
                             qDebug() << "❌ PDF YARATILMADI!";
                         }
                         webView->deleteLater();
                     });

    QUrl fileUrl = QUrl::fromLocalFile(QFileInfo(inputHtmlPath).absoluteFilePath());
    qDebug() << "Loading URL:" << fileUrl.toString();
    webView->load(fileUrl);

    // Fonda ishlaydi (ko'rinmaydi)
    webView->hide();
    qDebug() << "WebView yashirin ko'rsatildi, yuklanish kutilmoqda...";
}

void ProtocolForms::editProtocoleForm(QMap<QString, QString> clientProtocolForm)
{


    for (auto it = clientProtocolForm.begin(); it != clientProtocolForm.end(); ++it)
    {
        const QString &key = it.key();
        const QString &value = it.value();

        QWidget *widget = ui()->stackedWidget_5->widget(parent_->currentProtocolId_)->findChild<QWidget*>(key);
        if (!widget) {
            continue;
        }
        if (auto lineEdit = qobject_cast<QLineEdit*>(widget)) {
            lineEdit->setText(value);
        }
        else if (auto comboBox = qobject_cast<QComboBox*>(widget)) {
            int index = comboBox->findText(value);
            if (index >= 0)
                comboBox->setCurrentIndex(index);
            else
                comboBox->setCurrentText(value);
        }
        else {
            qDebug() << "Key mos kelmadi yoki topilmadi" << key;
        }
    }

    const QString &protocolFormCreateDateTime = clientProtocolForm.value("date", "");
    showProtocoleFillPage(true, protocolFormCreateDateTime);

}

void ProtocolForms::showProtocoleFillPage(bool check, const QString &protocolFormCreateDateTime)
{
    const auto lineEdits = ui()->stackedWidget_5->widget(parent_->currentProtocolId_)->findChildren<QLineEdit*>();
    const auto comboBoxes = ui()->stackedWidget_5->widget(parent_->currentProtocolId_)->findChildren<QComboBox*>();
    if(!check) {
        for (QLineEdit *lineEdit : lineEdits) {
            lineEdit->clear();
        }
        for (QComboBox *comboBox : comboBoxes) {
            comboBox->setCurrentIndex(-1);
        }
    }

    for (QLineEdit *lineEdit : lineEdits) {
        QString key = lineEdit->objectName();
        lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
    }
    for (QComboBox *comboBox : comboBoxes) {
        QString key = comboBox->objectName();
        comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
    }
    auto client = parent_->clientUseCase_->getClientById(parent_->currentClientId_);
    QString fullText = parent_->protocolTitle_ + " " + "(" +  " " + QString::fromStdString(client->getFullName()) + " " + ")" + " " + protocolFormCreateDateTime;
    ui()->PAGE->setText(fullText);
    ui()->stackedWidget_5->setCurrentWidget(ui()->stackedWidget_5->widget(parent_->currentProtocolId_));
}
void ProtocolForms::pushButtonSaveProtocol()
{
    json protocolData;

    const auto lineEdits = ui()->page->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }


    const auto comboBoxes = ui()->page->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}


void ProtocolForms::pushButtonSaveProtocol_sh()
{
    json protocolData;

    const auto lineEdits = ui()->shtavitka->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->shtavitka->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}



void ProtocolForms::pushButtonSaveProtocol_Selezenki()
{
    json protocolData;

    const auto lineEdits = ui()->selezyanaki->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->selezyanaki->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}


void ProtocolForms::pushButtonSaveProtocol_KolloniSustav()
{
    json protocolData;

    const auto lineEdits = ui()->kolonnisustav->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->kolonnisustav->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}


void ProtocolForms::pushButtonSaveProtocol_Nadpochechniki()
{
    json protocolData;

    const auto lineEdits = ui()->nadpochechniki->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->nadpochechniki->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}


void ProtocolForms::pushButtonSaveProtocol_TremestrBer()
{
    json protocolData;

    const auto lineEdits = ui()->pervomtrmestreber->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->pervomtrmestreber->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}


void ProtocolForms::pushButtonSaveProtocol_Follik()
{
    json protocolData;

    const auto lineEdits = ui()->follik->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->follik->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}

void ProtocolForms::pushButtonSaveProtocol_PechenBlank()
{
    json protocolData;

    const auto lineEdits = ui()->pechenBlank->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->pechenBlank->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}


void ProtocolForms::pushButtonSaveProtocol_MaliyTazBlank()
{
    json protocolData;

    const auto lineEdits = ui()->maliyTazBlank->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->maliyTazBlank->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}


void ProtocolForms::pushButtonSaveProtocol_PochkiBlank()
{
    json protocolData;

    const auto lineEdits = ui()->pochkiBlank->findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->pochkiBlank->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}



void ProtocolForms::pushButtonSaveProtocol_MalochniyJelBlank()
{
    json protocolData;

    const auto lineEdits = ui()->malochniyJelBlank->
                           findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->malochniyJelBlank->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}



void ProtocolForms::pushButtonSaveProtocol_prastataBlank()
{
    json protocolData;

    const auto lineEdits = ui()->prastataBlank->
                           findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->prastataBlank->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}




void ProtocolForms::pushButtonSaveProtocol_podjeludochBlank()
{
    json protocolData;

    const auto lineEdits = ui()->podjeludochBlank->
                           findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->podjeludochBlank->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}




void ProtocolForms::pushButtonSaveProtocol_plodBlank()
{
    json protocolData;

    const auto lineEdits = ui()->plodBlank->
                           findChildren<QLineEdit*>();
    for (QLineEdit *lineEdit : lineEdits)
    {
        QString key = lineEdit->objectName();
        QString value = lineEdit->text();

        if (!key.isEmpty()) {
            // if (value.trimmed().isEmpty()) {
            //     temp = true;
            //     lineEdit->setStyleSheet(utils::getProtocoLineEditErrorStyle(key));
            // } else {
                lineEdit->setStyleSheet(utils::getProtocoLineEditStyle(key));
                protocolData[key.toStdString()] = value.toStdString();
            // }
        }
    }

    const auto comboBoxes = ui()->plodBlank->findChildren<QComboBox*>();
    for (QComboBox *comboBox : comboBoxes)
    {
        QString key = comboBox->objectName();
        QString value = comboBox->currentText().trimmed();

        if (!key.isEmpty()) {
            // if (value.isEmpty()) {
            //     temp = true;
            //     comboBox->setStyleSheet(utils::getProtocolComboBoxErrorStyle(key));
            // } else {
                comboBox->setStyleSheet(utils::getProtocolComboBoxStyle(key));
                protocolData[key.toStdString()] = value.toStdString();

                // 🔥 yangi item qo'shish
                if (comboBox->findText(value) == -1) {
                    comboBox->addItem(value);
                }
            // }
        }
    }

    // if (temp)
    //     return;

    parent_->protocolUseCase_->createProtocolForm(
        parent_->currentClientId_,
        parent_->currentProtocolId_,
        protocolData
        );
    parent_->whoPage_ = AllPages::Pages::ClinetProtocols;
    parent_->protocolParts.loadProtocolsPage();
}
