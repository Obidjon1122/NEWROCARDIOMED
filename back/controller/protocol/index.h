#ifndef CONTROLLER_PROTOCOL_CONTROLLER_H
#define CONTROLLER_PROTOCOL_CONTROLLER_H

#include "../../usecase/protocol/index.h"
#include <memory>

namespace Controller
{

class ProtocolController
{
   private:
    std::unique_ptr<UseCase::ProtocolUseCase> protocolUseCase_;

    void printProtocolInfo(const std::shared_ptr<Domain::Protocol>& protocol);
    void printProtocolList(const Common::ProtocolDashboardResponse& response);
    void printProtocolIdAndClientId(const Common::ProtocolFormsResponse& response);

   public:
    explicit ProtocolController(std::unique_ptr<UseCase::ProtocolUseCase> userUseCase);

    void getProtocolById();
    void getAllByDoctorId();
    void getProtocolIdAndClientId();

    void showMenu();
    void runInteractiveMode();
};

}  // namespace Controller

#endif  // CONTROLLER_USER_CONTROLLER_H