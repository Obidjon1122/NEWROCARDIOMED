#ifndef UTILS_H
#define UTILS_H

#include <cstddef>
#include <algorithm>

#include <QString>
#include <QDate>

class utils
{
public:
    static size_t calculateDisplayCount(size_t size1, size_t size2);
    static QString extractYear(const QString& datetime);
    static QString formatDateToRussian(const QString& datetime);

    static QString getProtocoLineEditErrorStyle(const QString &objectName);
    static QString getProtocoLineEditStyle(const QString &objectName);
    static QString getProtocolComboBoxStyle(const QString &objectName);
    static QString getProtocolComboBoxErrorStyle(const QString &objectName);
};

#endif // UTILS_H
