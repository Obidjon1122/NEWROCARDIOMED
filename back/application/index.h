#ifndef APPLICATION_H
#define APPLICATION_H

#include "../infrastructure/storage/index.h"
#include "../repository/client/index.h"
#include "../repository/protocol/index.h"
#include "../repository/user/index.h"
#include "../repository/protocol_template/index.h"
#include "../usecase/client/index.h"
#include "../usecase/protocol/index.h"
#include "../usecase/user/index.h"
#include "../usecase/protocol_template/index.h"
#include <algorithm>
#include <iostream>
#include <memory>

namespace Nevrocardiomed
{
class Application
{
   private:
    std::unique_ptr<Infrastructure::Storage::DatabaseConnection> dbConnection_;
    std::unique_ptr<UseCase::UserUseCase>                        userUseCase_;
    std::unique_ptr<UseCase::ClientUseCase>                      clientUseCase_;
    std::unique_ptr<UseCase::ProtocolUseCase>                    protocolUseCase_;
    std::unique_ptr<UseCase::ProtocolTemplateUseCase>            protocolTemplateUseCase_;

   public:
    Application();

    UseCase::UserUseCase*     getUserUseCase() const;
    UseCase::ClientUseCase*   getClientUseCase() const;
    UseCase::ProtocolUseCase* getProtocolUseCase() const;
    UseCase::ProtocolTemplateUseCase* getProtocolTemplateUseCase() const;
};
}  // namespace Nevrocardiomed

#endif  // APPLICATION_H
