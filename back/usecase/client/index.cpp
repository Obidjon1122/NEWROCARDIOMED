#include "index.h"

#include <algorithm>
#include <iostream>
#include <regex>

namespace UseCase
{

ClientUseCase::ClientUseCase(std::unique_ptr<Repositories::ClientRepository> clientrRepository)
    : clientRepository_(std::move(clientrRepository))
{
}

bool ClientUseCase::validateCreateRequest(const CreateClientRequest& request, Common::CreateClientResponse& response)
{
    if (request.firstName.empty() || request.firstName.length() > 60) {
        response.error = true;
        response.errorMessage = "Ошибка: имя пустое или превышает 60 символов.";
        return false;
    }

    if (request.lastName.empty() || request.lastName.length() > 60) {
        response.error = true;
        response.errorMessage = "Ошибка: фамилия пустая или превышает 60 символов.";
        return false;
    }

    if (!validatePhone(request.phone)) {
        response.error = true;
        response.errorMessage = "Ошибка: неверный формат телефона.";
        return false;
    }

    // if (!validDateFormat(request.birth_date)) {
    //     response.error = true;
    //     response.errorMessage = "Ошибка: неверный формат даты рождения.";
    //     return false;
    // }

    if (request.region.empty()) {
        response.error = true;
        response.errorMessage = "Ошибка: регион не указан.";
        return false;
    }

    return true;
}


// bool ClientUseCase::validDateFormat(const std::string& date)
// {
//     if (date.length() != 10)
//         return false;

//     std::regex dateRegex(R"(\d{4}-\d{2}-\d{2})");
//     if (!std::regex_match(date, dateRegex))
//         return false;

//     try {
//         int year  = std::stoi(date.substr(0, 4));
//         int month = std::stoi(date.substr(5, 2));
//         int day   = std::stoi(date.substr(8, 2));

//         if (year < 1900 || year > 2100)
//             return false;
//         if (month < 1 || month > 12)
//             return false;
//         if (day < 1 || day > 31)
//             return false;

//         return true;
//     } catch (const std::exception&) {
//         return false;
//     }
// }

bool ClientUseCase::validateUpdateRequest(const UpdateClientRequest& request, Common::CreateClientResponse& response)
{
    if (request.id <= 0) {
        std::cerr << "[USECASE] Client ID xato" << std::endl;
        return false;
    }

    return validateCreateRequest({request.firstName, request.lastName, request.gender, request.phone, request.birth_date, request.region},
                                response);
}

bool ClientUseCase::validatePhone(const std::string& phone)
{
    if (phone.empty()) {
        return true;
    }

    std::regex phoneRegex(R"(^\+?\d{9,20}$)");
    if (!std::regex_match(phone, phoneRegex)) {
        return false;
    }

    return true;
}

Common::CreateClientResponse ClientUseCase::createClient(const CreateClientRequest& request)
{
    std::cout << "[USECASE] Создание клиента: " << request.firstName << " " << request.lastName << std::endl;
    Common::CreateClientResponse response;
    
    if (!validateCreateRequest(request, response)) {
        return response;
    }

    // if (!request.phone.empty() && phoneExists(request.phone)) {
    //     response.error = true;
    //     response.errorMessage = "Ошибка: данный номер телефона уже существует.";
    //     return response;
    // }

    Domain::Client client(request.firstName, request.lastName, request.gender, request.phone,
                          request.birth_date, request.region);
 
    auto newClient = clientRepository_->create(client);
    if (!newClient) {
        response.error = true;
        response.errorMessage = "Ошибка: не удалось сохранить клиента в базу данных.";
        return response;
    }

    response.clientId = newClient->getId();
    return response;
}


std::shared_ptr<Domain::Client> ClientUseCase::getClientById(int64_t id)
{
    if (id <= 0) {
        std::cerr << "[USECASE] Client ID xato: " << id << std::endl;
        return nullptr;
    }

    return clientRepository_->getById(id);
}

std::shared_ptr<Domain::Client> ClientUseCase::getClientByPhone(const std::string& phone)
{
    if (!validatePhone(phone)) {
        return nullptr;
    }

    return clientRepository_->getByPhone(phone);
}

Common::CreateClientResponse ClientUseCase::updateClient(const UpdateClientRequest& request)
{
    Common::CreateClientResponse response;
    if (!validateUpdateRequest(request, response)) {
        return response;
    }

    if (!clientExists(request.id)) {
        response.error = true;
        response.errorMessage = "Пользователь с таким ID не существует.";
        return response;
    }

    auto client = std::make_shared<Domain::Client>();
    client->setId(request.id);
    client->setFirstName(request.firstName);
    client->setGender(request.gender);
    client->setLastName(request.lastName);
    client->setPhone(request.phone);
    client->setBirthDate(request.birth_date);
    client->setRegion(request.region);

    client = clientRepository_->update(client);
    if(!client) {
        response.error = true;
        response.errorMessage = "Ошибка: не удалось сохранить клиента в базу данных.";
        return response;
    }
    response.clientId = client->getId();
    return response;
}

bool ClientUseCase::deleteClient(int64_t id)
{
    std::cout << "[USECASE] Client o'chirish: ID " << id << std::endl;

    if (id <= 0) {
        std::cerr << "[USECASE] Client ID xato: " << id << std::endl;
        return false;
    }

    if (!clientExists(id)) {
        std::cerr << "[USECASE] Client topilmadi: ID " << id << std::endl;
        return false;
    }

    return clientRepository_->deleteById(id);
}

Common::PaginationResponse<Domain::Client> ClientUseCase::getAllClientByProtocolId(
        const Common::PaginationRequest& request, int64_t id, const std::string& text)
{
    std::cout << "[USECASE] Protocol Id Clients ro'yxati: Page " << request.page << ", Size " << request.pageSize
              << std::endl;

    if (request.page <= 0 || request.pageSize <= 0 || request.pageSize > 100 || id < 1) {
        throw std::invalid_argument("Pagination parametrlari xato");
    }

    return clientRepository_->getAllClientByProtocolId(request, id, text);
}

Common::PaginationResponse<Domain::Client> ClientUseCase::getAllClients(const Common::PaginationRequest& request,
                                                                        const std::string&               text)
{
    std::cout << "[USECASE] Clients ro'yxati: Page " << request.page << ", Size " << request.pageSize << std::endl;

    if (request.page <= 0 || request.pageSize <= 0 || request.pageSize > 100) {
        throw std::invalid_argument("Pagination parametrlari xato");
    }

    return clientRepository_->getAll(request, text);
}

int ClientUseCase::getTotalClientsCount()
{
    return clientRepository_->getTotalCount();
}

bool ClientUseCase::clientExists(int64_t id)
{
    return clientRepository_->existsById(id);
}

}  // namespace UseCase
