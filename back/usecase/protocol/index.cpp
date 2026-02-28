#include "index.h"

#include <algorithm>
#include <iostream>
#include <regex>

namespace UseCase
{

ProtocolUseCase::ProtocolUseCase(std::unique_ptr<Repositories::ProtocolRepository> protocolRepository)
    : protocolrRepository_(std::move(protocolRepository))
{
}

std::shared_ptr<Domain::Protocol> ProtocolUseCase::getProtocolById(int64_t id)
{
    if (id <= 0) {
        std::cerr << "[USECASE] Protocol ID xato: " << id << std::endl;
        return nullptr;
    }

    return protocolrRepository_->getById(id);
}

Common::ProtocolDashboardResponse ProtocolUseCase::getAllByDoctorId(int64_t id)
{
    return protocolrRepository_->getAllByDoctorId(id);
}

Common::ProtocolFormsResponse ProtocolUseCase::getProtocolIdAndClientId(Common::PaginationRequest request,
                                                                        int64_t clientId, int64_t protocolID, std::string date)
{
    std::cout << "[USECASE] Protocol Id Clients ro'yxati: Page " << request.page << ", Size " << request.pageSize
              << std::endl;

    if (request.page <= 0 || request.pageSize <= 0 || request.pageSize > 100) {
        throw std::invalid_argument("Pagination parametrlari xato");
    }
    std::cout << clientId << " " << protocolID << " "
              << "USECASE" << std::endl;
    return protocolrRepository_->getClientIdAndProtocolId(request, clientId, protocolID, date);
}

QMap<QString, QString> ProtocolUseCase::getProtoclFormByClientIdProtocolId(int64_t protocolFormId, int64_t clientId, int64_t doctorId) {
    qInfo() << "\n[USECASE] === ЗАПРОС ПРОТОКОЛА ===";
    qInfo() <<" ProtocolForm ID:" << protocolFormId;

    QMap<QString, QString> protocolForm = protocolrRepository_->getProtoclFormByClientIdProtocolId(protocolFormId, clientId, doctorId);

    if (protocolForm.empty()) {
        qWarning() << "[USECASE] ⚠️ Протокол не найден или пустой.";
        return {};
    }

    qInfo() << "\n========== ПРОТОКОЛ ДАННЫЕ ==========";
    #ifdef QT_CORE_LIB
        for (auto it = protocolForm.constBegin(); it != protocolForm.constEnd(); ++it) {
            qInfo().noquote() << it.key() + ": " + it.value();
        }
    #else
        for (const auto& kv : protocolForm) {
            qInfo() << kv.first << ": " << kv.second << "\n";
        }
    #endif

    qInfo() << "\n[USECASE] === КОНЕЦ ВЫВОДА ПРОТОКОЛА ===";
    return protocolForm;
}

void ProtocolUseCase::createProtocolForm(int64_t clientId, int64_t protocolId, json protocolForm)
{
    if(clientId <= 0) {
        throw std::invalid_argument("Client Id xato UseCase Create Protocol");
    }

    if(protocolId <= 0) {
        throw std::invalid_argument("Protocol Id xato UseCase Create Protocol");
    }

    if(protocolForm.empty()) {
        throw std::invalid_argument("Protocol Form xato UseCase Create Protocol");
    }

    return protocolrRepository_->createProtocolForm(clientId, protocolId, protocolForm);
}


Common::ProtocolFormsResponse ProtocolUseCase::getClientId(Common::PaginationRequest request, int64_t clientId)
{
    std::cout << "[USECASE] Protocol Id Clients ro'yxati: Page " << request.page << ", Size " << request.pageSize
              << std::endl;

    if (request.page <= 0 || request.pageSize <= 0 || request.pageSize > 100) {
        throw std::invalid_argument("Pagination parametrlari xato");
    }
    std::cout << clientId << " "
              << "USECASE" << std::endl;
    return protocolrRepository_->getClientId(request, clientId);
}

bool ProtocolUseCase::protocolExists(int64_t id)
{
    return protocolrRepository_->existsById(id);
}

}  // namespace UseCase
