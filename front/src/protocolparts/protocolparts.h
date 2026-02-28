#ifndef PROTOCOLPARTS_H
#define PROTOCOLPARTS_H

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


class ProtocolParts
{
public:
    ProtocolParts(AllPages* parent);

    void loadProtocolsPage();
    Common::ProtocolFormsResponse getProtocolFormsResponse(const Common::PaginationRequest& request);
    void displayProtocolAndClientId(const Common::ProtocolFormsResponse& response);
    void populateProtocolRow(
        int index,
        const Common::ProtocolForms& item,
        QLabel* nameLabel,
        QLabel* dateLabel);
    void clearProtocolLabels();
    void loadClientPageProtocolIdSearchDate(QString date);

private:
    AllPages* parent_;
    Ui::AllPages* ui();

    static constexpr int MAX_PER_PAGE = 10;
};

#endif // PROTOCOLPARTS_H
