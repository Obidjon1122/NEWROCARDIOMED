#include "utils.h"

size_t utils::calculateDisplayCount(size_t size1, size_t size2)
{
    return std::min(size1, size2);
}

QString utils::extractYear(const QString& datetime) {
    QDate date = QDate::fromString(datetime, "yyyy-MM-dd");

    if (!date.isValid()) {
        QDateTime dt = QDateTime::fromString(datetime.left(19), "yyyy-MM-dd HH:mm:ss");
        if (dt.isValid()) {
            date = dt.date();
        }
    }

    if (!date.isValid()) {
        QDateTime dt = QDateTime::fromString(datetime, "yyyy-MM-dd HH:mm:ss.zzz");
        if (dt.isValid()) {
            date = dt.date();
        }
    }

    if (!date.isValid()) {
        qWarning() << "Yilni olishda xato:" << datetime;
        return "";
    }

    return QString::number(date.year());
}

QString utils::formatDateToRussian(const QString& datetime) {
    static const QStringList russianMonths = {
        "январь", "февраль", "март", "апрель",
        "май", "июнь", "июль", "август",
        "сентябрь", "октябрь", "ноябрь", "декабрь"
    };


    QDate date;
    date = QDate::fromString(datetime, "yyyy-MM-dd");

    if (!date.isValid()) {
        QDateTime dt = QDateTime::fromString(datetime.left(19), "yyyy-MM-dd HH:mm:ss");
        if (dt.isValid()) {
            date = dt.date();
        }
    }

    if (!date.isValid()) {
        QDateTime dt = QDateTime::fromString(datetime, "yyyy-MM-dd HH:mm:ss.zzz");
        if (dt.isValid()) {
            date = dt.date();
        }
    }

    if (!date.isValid()) {
        qWarning() << "Sanani parse qilib bo'lmadi:" << datetime;
        return "";
    }

    int day = date.day();
    int month = date.month();

    return QString("%1-%2").arg(day).arg(russianMonths[month - 1]);
}



QString utils::getProtocoLineEditErrorStyle(const QString &objectName)
{
    return QString(R"(

#%1 {
    background-color: #F9F9F9;
    border-radius: 8px;
    border: 1.5px solid #E53935;
    color: #333333;
    font-size: 16px;
    padding: 8px 12px;
    min-height: 40px;
}

)").arg(objectName);
}

QString utils::getProtocoLineEditStyle(const QString &objectName)
{
    return QString(R"(

#%1 {
    background-color: #F9F9F9;
    border-radius: 8px;
    color: #333333;
    font-size: 16px;
    padding: 8px 12px;
    min-height: 40px;
}

)").arg(objectName);
}

QString utils::getProtocolComboBoxStyle(const QString &objectName)
{
    return QString(R"(
#%1 {
    border-radius: 8px;
    background: #F9F9F9;
    padding-left: 12px;
    font-size: 16px;
    color: #333333;
    min-height: 40px;
}

#%1::drop-down {
    width: 50px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    background: #F9F9F9;
    border-left: none;
}

#%1::drop-down:hover {
    background: #F9F9F9;
}

#%1::down-arrow {
    image: url(:/icons/media/icons/down-arrow.png);
    width: 16px;
    height: 16px;
}

#%1 QAbstractItemView {
    background: #F9F9F9;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    outline: none;
    selection-background-color: #E8F5E9;
    selection-color: #000;
    padding: 4px;
}

#%1 QAbstractItemView::item {
    padding-left: 12px;
    padding-right: 12px;
    font-size: 18px;
    color: #000;
    border-radius: 6px;
    margin: 2px 0px;
}

#%1 QAbstractItemView::item:hover {
    background-color: #F1F8F4;
}

#%1 QAbstractItemView::item:selected {
    background-color: #E8F5E9;
    color: #000;
}
)").arg(objectName);
}

QString utils::getProtocolComboBoxErrorStyle(const QString &objectName)
{
    return QString(R"(
#%1 {
    border-radius: 8px;
    border: 1.5px solid #E53935;
    background: #F9F9F9;
    padding-left: 12px;
    font-size: 16px;
    color: #333333;
    min-height: 40px;
}

#%1::drop-down {
    width: 50px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    background: #F9F9F9;
    border-left: none;
}

#%1::drop-down:hover {
    background: #F9F9F9;
}

#%1::down-arrow {
    image: url(:/icons/media/icons/down-arrow.png);
    width: 16px;
    height: 16px;
}

#%1 QAbstractItemView {
    background: #F9F9F9;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    outline: none;
    selection-background-color: #E8F5E9;
    selection-color: #000;
    padding: 4px;
}

#%1 QAbstractItemView::item {
    padding-left: 12px;
    padding-right: 12px;
    font-size: 18px;
    color: #000;
    border-radius: 6px;
    margin: 2px 0px;
}

#%1 QAbstractItemView::item:hover {
    background-color: #F1F8F4;
}

#%1 QAbstractItemView::item:selected {
    background-color: #E8F5E9;
    color: #000;
}
)").arg(objectName);
}







