#include "searchcalendardilalog.h"
#include "../../allpages.h"
#include "ui_searchcalendardilalog.h"
#include <QLocale>

SearchCalendarDilalog::SearchCalendarDilalog(QWidget *parent, AllPages *AllPage)
    : QDialog(parent)
    , ui(new Ui::SearchCalendarDilalog)
    , allPages_(AllPage)
{
    ui->setupUi(this);

    ui->calendarWidget->setLocale(QLocale(QLocale::Russian, QLocale::Russia));

    ui->calendarWidget->setFirstDayOfWeek(Qt::Monday);

    ui->calendarWidget->setSelectedDate(QDate::currentDate());

    setWindowFlags(Qt::Dialog | Qt::FramelessWindowHint);

    if (parent)
    {
        QRect parentRect = parent->geometry();
        QPoint center = parent->mapToGlobal(parentRect.center());
        move(center - QPoint(width() / 2, height() / 2));
    }
}

SearchCalendarDilalog::~SearchCalendarDilalog()
{
    delete ui;
}

void SearchCalendarDilalog::on_calendarWidget_clicked(const QDate &date)
{
    QString dateString = date.toString("yyyy-MM-dd");
    allPages_->protocolParts.loadClientPageProtocolIdSearchDate(dateString);
    this->close();
}

void SearchCalendarDilalog::on_pushButtonQuit1_clicked()
{
    this->close();
}
