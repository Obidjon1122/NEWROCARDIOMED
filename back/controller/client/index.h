#ifndef CONTROLLER_CLIENT_CONTROLLER_H
#define CONTROLLER_CLIENT_CONTROLLER_H

#include "../../usecase/client/index.h"
#include <memory>

namespace Controller
{

class ClientController
{
   private:
    std::unique_ptr<UseCase::ClientUseCase> clientUseCase_;

    void printClientInfo(const std::shared_ptr<Domain::Client>& client);
    void printPaginationInfo(const Common::PaginationResponse<Domain::Client>& response);
    void printClientList(const std::vector<std::shared_ptr<Domain::Client>>& clients);

   public:
    explicit ClientController(std::unique_ptr<UseCase::ClientUseCase> userUseCase);

    void createClient();
    void getClientById();
    void getClientByPhone();
    void updateClient();
    void deleteClient();
    void getAllClient();
    void getAllClientByProtocolId();

    void showMenu();
    void runInteractiveMode();
};

}  // namespace Controller

#endif  // CONTROLLER_USER_CONTROLLER_H