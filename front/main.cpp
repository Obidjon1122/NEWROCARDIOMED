#include <QApplication>
#include <QIcon>
#include <QCoreApplication>
#include <QFile>
#include <QTextStream>
#include <QDateTime>
#include "../back/application/index.h"
#include "allpages.h"

int main(int argc, char *argv[])
{
    // ⭐ QTWEBENGINE SOZLAMALARI - QAPPLICATION DAN OLDIN! ⭐
#ifdef Q_OS_WIN
    qputenv("QTWEBENGINEPROCESS_PATH", "QtWebEngineProcess.exe");
#elif defined(Q_OS_MAC)
    qputenv("QTWEBENGINEPROCESS_PATH", "/opt/homebrew/lib/QtWebEngineCore.framework/Helpers/QtWebEngineProcess.app/Contents/MacOS/QtWebEngineProcess");
#endif
    qputenv("QTWEBENGINE_CHROMIUM_FLAGS", "--disable-gpu --no-sandbox");

    QApplication a(argc, argv);

    // ⭐ ICON O'RNATISH - ENG MUHIM QISM! ⭐
    QIcon appIcon(":/icons/media/icons/icon.ico");

    if (appIcon.isNull()) {
        qWarning() << "⚠️ Icon yuklanmadi! Fayl yo'li noto'g'ri!";
        appIcon = QIcon(":/icons/media/icons/ico.ico");
    } else {
        qDebug() << "✅ Icon muvaffaqiyatli yuklandi!";
    }

    // Application uchun icon o'rnatish
    a.setWindowIcon(appIcon);

    // Application ma'lumotlari
    a.setApplicationName("NEVROCARDIOMED");
    a.setApplicationDisplayName("NEVROCARDIOMED - Tibbiy Dastur");
    a.setOrganizationName("NEVROCARDIOMED");
    a.setOrganizationDomain("nevrocardiomed.uz");
    a.setApplicationVersion("1.0.0");

    qDebug() << "========================================";
    qDebug() << "NEVROCARDIOMED ishga tushdi";
    qDebug() << "Icon isNull:" << appIcon.isNull();
    qDebug() << "========================================";

    auto app = Nevrocardiomed::Application();
    AllPages all(app);

    // ⭐ Window uchun ham icon o'rnatish ⭐
    all.setWindowIcon(appIcon);

    all.show();
    return a.exec();
}
