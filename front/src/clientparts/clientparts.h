#ifndef CLIENTPARTS_H
#define CLIENTPARTS_H

#include <QObject>
#include <QEvent>
#include <QLabel>
#include <memory>

// Forward declarations
class AllPages;
namespace Ui { class AllPages; }
namespace Domain { class Client; }
namespace Common {
template<typename T> struct PaginationResponse;
}

class ClientParts
{
public:
    explicit ClientParts(AllPages* parent);

    bool handleClientsNavigation(QObject* watched, QEvent* event);
    void loadClientsPage();
    void setClientsStyle(bool isHovered);
    void displayClients(const Common::PaginationResponse<Domain::Client>& clients);
    void populateClientRow(
        int index,
        const std::shared_ptr<Domain::Client>& client,
        QLabel* nameLabel,
        QLabel* dateLabel);

private:
    AllPages* parent_;
    Ui::AllPages* ui();
};

#endif // CLIENTPARTS_H
