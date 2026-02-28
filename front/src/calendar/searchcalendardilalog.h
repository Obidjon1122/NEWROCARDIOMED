#ifndef SEARCHCALENDARDILALOG_H
#define SEARCHCALENDARDILALOG_H

#include <QDialog>

class AllPages;

namespace Ui {
class SearchCalendarDilalog;
}

class SearchCalendarDilalog : public QDialog
{
    Q_OBJECT

public:
    explicit SearchCalendarDilalog(QWidget *parent = nullptr, AllPages *MainPage = nullptr);
    ~SearchCalendarDilalog();

private slots:
    void on_calendarWidget_clicked(const QDate &date);

    void on_pushButtonQuit1_clicked();

private:
    Ui::SearchCalendarDilalog *ui;
    AllPages* allPages_;
};

#endif // SEARCHCALENDARDILALOG_H
