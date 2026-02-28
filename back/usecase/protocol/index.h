#ifndef USECASE_PROTOCOL_USECASE_H
#define USECASE_PROTOCOL_USECASE_H

#include "../../domain/protocol/index.h"
#include "../../repository/protocol/index.h"

#ifdef QT_CORE_LIB
#include <QMap>
#include <QString>
#include <QDebug>
#else
#include <map>
#include <string>
#include <iostream>
using QString = std::string;
template<typename K, typename V>
using QMap = std::map<K, V>;
#define qInfo() std::cout
#define qWarning() std::cerr
#define qDebug() std::cout
#endif

namespace UseCase
{

struct CreateProtocolRequest {
    std::string Title;
    int64_t     doctorId;
};

struct UpdateProtocolRequest {
    int64_t     id;
    std::string Title;
    int64_t     doctorId;
};

class ProtocolUseCase
{
   private:
    std::unique_ptr<Repositories::ProtocolRepository> protocolrRepository_;

   public:
    explicit ProtocolUseCase(std::unique_ptr<Repositories::ProtocolRepository> protocolRepository);

    std::shared_ptr<Domain::Protocol> getProtocolById(int64_t id);
    Common::ProtocolDashboardResponse getAllByDoctorId(int64_t id);
    Common::ProtocolFormsResponse     getProtocolIdAndClientId(Common::PaginationRequest request, int64_t clientId,
                                                               int64_t protocolID, std::string date = "");
    Common::ProtocolFormsResponse     getClientId(Common::PaginationRequest request, int64_t clientId);
    QMap<QString, QString> getProtoclFormByClientIdProtocolId(int64_t protocolFormId, int64_t clientId, int64_t doctorId);
    bool                              protocolExists(int64_t id);
    void createProtocolForm(int64_t clientId, int64_t protocolId, json protocolForm);
};

}  // namespace UseCase

#endif  // USECASE_CLIENT_USECASE_H
