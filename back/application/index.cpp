#include "index.h"

namespace Nevrocardiomed
{

Application::Application()
{
    dbConnection_ = std::make_unique<Infrastructure::Storage::DatabaseConnection>();

    if (!dbConnection_->connect()) {
        std::cerr << "[MAIN] Database'ga ulanish xatosi!" << std::endl;
    }

    auto userRepository     = std::make_unique<Repositories::UserRepository>(dbConnection_.get());
    auto clientRepository   = std::make_unique<Repositories::ClientRepository>(dbConnection_.get());
    auto protocolRepository = std::make_unique<Repositories::ProtocolRepository>(dbConnection_.get());
    auto protocolTemplateRepository = std::make_unique<Repositories::ProtocolTemplateRepository>(dbConnection_.get());

    userUseCase_     = std::make_unique<UseCase::UserUseCase>(std::move(userRepository));
    clientUseCase_   = std::make_unique<UseCase::ClientUseCase>(std::move(clientRepository));
    protocolUseCase_ = std::make_unique<UseCase::ProtocolUseCase>(std::move(protocolRepository));
    protocolTemplateUseCase_ = std::make_unique<UseCase::ProtocolTemplateUseCase>(protocolTemplateRepository.release());
}

UseCase::UserUseCase* Application::getUserUseCase() const
{
    return userUseCase_.get();
}

UseCase::ClientUseCase* Application::getClientUseCase() const
{
    return clientUseCase_.get();
}

UseCase::ProtocolUseCase* Application::getProtocolUseCase() const
{
    return protocolUseCase_.get();
}

UseCase::ProtocolTemplateUseCase* Application::getProtocolTemplateUseCase() const
{
    return protocolTemplateUseCase_.get();
}

}  // namespace Nevrocardiomed
