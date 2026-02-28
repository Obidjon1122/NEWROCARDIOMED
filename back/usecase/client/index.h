#ifndef USECASE_CLIENT_USECASE_H
#define USECASE_CLIENT_USECASE_H

#include "../../domain/client/index.h"
#include "../../repository/client/index.h"

namespace UseCase
{

struct CreateClientRequest {
    std::string firstName;
    std::string lastName;
    std::string gender;
    std::string phone;
    std::string birth_date;
    std::string region;
};

struct UpdateClientRequest {
    int64_t     id;
    std::string firstName;
    std::string lastName;
    std::string gender;
    std::string phone;
    std::string birth_date;
    std::string region;
};

class ClientUseCase
{
   private:
    std::unique_ptr<Repositories::ClientRepository> clientRepository_;

    bool validateCreateRequest(const CreateClientRequest& request, Common::CreateClientResponse& response);
    // bool validDateFormat(const std::string& date);
    bool validateUpdateRequest(const UpdateClientRequest& request, Common::CreateClientResponse& response);

   public:
    explicit ClientUseCase(std::unique_ptr<Repositories::ClientRepository> clientRepository);

    Common::CreateClientResponse createClient(const CreateClientRequest& request);
    std::shared_ptr<Domain::Client> getClientById(int64_t id);
    std::shared_ptr<Domain::Client> getClientByPhone(const std::string& phone);
    Common::CreateClientResponse updateClient(const UpdateClientRequest& request);
    bool                            deleteClient(int64_t id);

    Common::PaginationResponse<Domain::Client> getAllClients(const Common::PaginationRequest& request,
                                                             const std::string&               text);
    Common::PaginationResponse<Domain::Client> getAllClientByProtocolId(const Common::PaginationRequest& request,
                                                                        int64_t id, const std::string& text);

    int  getTotalClientsCount();
    bool clientExists(int64_t id);

    bool validatePhone(const std::string& phone);
};

}  // namespace UseCase

#endif  // USECASE_CLIENT_USECASE_H
