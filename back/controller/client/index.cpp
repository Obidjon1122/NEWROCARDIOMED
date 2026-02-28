#include "index.h"

#include <iostream>
#include <limits>
#include <string>

namespace Controller
{

ClientController::ClientController(std::unique_ptr<UseCase::ClientUseCase> userUseCase)
    : clientUseCase_(std::move(userUseCase))
{
}

void ClientController::printClientInfo(const std::shared_ptr<Domain::Client>& client)
{
    std::cout << "\n┌──────────────────────────────────────┐" << std::endl;
    std::cout << "│              CLINET INFO               │" << std::endl;
    std::cout << "├──────────────────────────────────────┤" << std::endl;
    std::cout << "│ ID      : " << client->getId() << std::endl;
    std::cout << "│ Name    : " << client->getFullName() << std::endl;
    std::cout << "│ Gender    : " << client->getGender() << std::endl;
    std::cout << "│ Phone   : " << client->getPhone() << std::endl;
    std::cout << "│ Birth   : " << client->getBirthDate() << std::endl;
    std::cout << "│ Region   : " << client->getRegion() << std::endl;
    std::cout << "│ Created : " << client->getCreatedAt() << std::endl;
    std::cout << "│ Updated : " << client->getUpdatedAt() << std::endl;
    std::cout << "└──────────────────────────────────────┘" << std::endl;
}

void ClientController::printPaginationInfo(const Common::PaginationResponse<Domain::Client>& response)
{
    std::cout << "\n📄 PAGINATION INFO:" << std::endl;
    std::cout << "   Current Page: " << response.currentPage << std::endl;
    std::cout << "   Page Size: " << response.pageSize << std::endl;
    std::cout << "   Total Count: " << response.totalCount << std::endl;
    std::cout << "   Total Pages: " << response.totalPages << std::endl;
    std::cout << "   Has Next: " << (response.hasNext ? "Yes" : "No") << std::endl;
    std::cout << "   Has Previous: " << (response.hasPrevious ? "Yes" : "No") << std::endl;
    std::cout << "   Clients on this page: " << response.items.size() << std::endl;
}

void ClientController::printClientList(const std::vector<std::shared_ptr<Domain::Client>>& clients)
{
    std::cout << "\n👥 CLIENTS LIST (" << clients.size() << " clients):" << std::endl;
    std::cout << "┌────┬──────────────────────┬──────────┬──────────────────┬──────────────┬──────────────┐"
              << std::endl;
    std::cout << "│ ID │        NAME          │  GENDER  │      PHONE       │   BIRTH      │   REGION     │"
              << std::endl;
    std::cout << "├────┼──────────────────────┼──────────┼──────────────────┼──────────────┼──────────────┤"
              << std::endl;

    auto pad = [](const std::string& s, size_t width) {
        if (s.size() >= width)
            return s.substr(0, width);
        return s + std::string(width - s.size(), ' ');
    };

    for (const auto& client : clients) {
        auto idStr      = std::to_string(client->getId());
        auto name       = client->getFullName();
        auto gender     = client->getGender();
        auto phone      = client->getPhone();
        auto birth_date = client->getBirthDate();
        auto region     = client->getRegion();

        std::cout << "│ " << pad(idStr, 2) << " │ " << pad(name, 20) << " │ " << pad(gender, 8) << " │ "
                  << pad(phone, 16) << " │ " << pad(birth_date, 12) << " │ " << pad(region, 12) << " │" << std::endl;
    }

    std::cout << "└────┴──────────────────────┴──────────┴──────────────────┴──────────────┴──────────────┘"
              << std::endl;
}

void ClientController::createClient()
{
    std::cout << "\n🆕 CREATE NEW CLIENT" << std::endl;
    std::cout << "===================" << std::endl;

    UseCase::CreateClientRequest request;

    std::cout << "First Name: ";
    std::getline(std::cin, request.firstName);

    std::cout << "Last Name: ";
    std::getline(std::cin, request.lastName);

    std::cout << "Gender (male/female): ";
    std::getline(std::cin, request.gender);

    std::cout << "Phone: ";
    std::getline(std::cin, request.phone);

    std::cout << "Birth: ";
    std::getline(std::cin, request.birth_date);

    std::cout << "Region: ";
    std::getline(std::cin, request.region);

    try {
        auto client = clientUseCase_->createClient(request);
        std::cout << "\n✅ Client muvaffaqiyatli yaratildi!" << std::endl;
        // printClientInfo(client);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ClientController::getClientById()
{
    std::cout << "\n🔍 GET CLIENT BY ID" << std::endl;
    std::cout << "=================" << std::endl;

    int64_t id;
    std::cout << "Client ID: ";
    std::cin >> id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    try {
        auto user = clientUseCase_->getClientById(id);
        if (user) {
            std::cout << "\n✅ Client topildi!" << std::endl;
            printClientInfo(user);
        }
        else {
            std::cout << "\n❌ Client topilmadi (ID: " << id << ")" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ClientController::getClientByPhone()
{
    std::cout << "\n📱 GET CLIENT BY PHONE" << std::endl;
    std::cout << "===================" << std::endl;

    std::string phone;
    std::cout << "Phone: ";
    std::getline(std::cin, phone);

    try {
        auto client = clientUseCase_->getClientByPhone(phone);
        if (client) {
            std::cout << "\n✅ Client topildi!" << std::endl;
            printClientInfo(client);
        }
        else {
            std::cout << "\n❌ Client topilmadi (Phone: " << phone << ")" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ClientController::updateClient()
{
    std::cout << "\n✏️ UPDATE CLIENT" << std::endl;
    std::cout << "==============" << std::endl;

    UseCase::UpdateClientRequest request;

    std::cout << "Client ID: ";
    std::cin >> request.id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    std::cout << "First Name: ";
    std::getline(std::cin, request.firstName);

    std::cout << "Last Name: ";
    std::getline(std::cin, request.lastName);

    std::cout << "Gender (male/female): ";
    std::getline(std::cin, request.gender);

    std::cout << "Phone: ";
    std::getline(std::cin, request.phone);

    std::cout << "Birth Date: ";
    std::getline(std::cin, request.birth_date);

    std::cout << "Region: ";
    std::getline(std::cin, request.region);

    try {
        auto client = clientUseCase_->updateClient(request);
        std::cout << "\n✅ Client muvaffaqiyatli yangilandi!" << std::endl;
        // printClientInfo(client);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ClientController::deleteClient()
{
    std::cout << "\n🗑️ DELETE CLIENT" << std::endl;
    std::cout << "===============" << std::endl;

    int64_t id;
    std::cout << "Client ID: ";
    std::cin >> id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    std::cout << "Rostdan ham o'chirmoqchimisiz? (y/n): ";
    char confirm;
    std::cin >> confirm;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    if (confirm == 'y' || confirm == 'Y') {
        try {
            bool deleted = clientUseCase_->deleteClient(id);
            if (deleted) {
                std::cout << "\n✅ Client muvaffaqiyatli o'chirildi!" << std::endl;
            }
            else {
                std::cout << "\n❌ Client o'chirilmadi" << std::endl;
            }
        } catch (const std::exception& e) {
            std::cout << "\n❌ Xato: " << e.what() << std::endl;
        }
    }
    else {
        std::cout << "\n❌ Operatsiya bekor qilindi" << std::endl;
    }
}

void ClientController::getAllClientByProtocolId()
{
    std::cout << "\n📋 GET ALL CLIENT BY PROTOCOL ID" << std::endl;
    std::cout << "================" << std::endl;

    Common::PaginationRequest request;

    std::cout << "Page number [1]: ";
    std::string pageInput;
    int64_t     protocolId;
    std::getline(std::cin, pageInput);
    if (!pageInput.empty()) {
        request.page = std::stoi(pageInput);
    }

    std::cout << "Page size [10]: ";
    std::string sizeInput;
    std::getline(std::cin, sizeInput);
    if (!sizeInput.empty()) {
        request.pageSize = std::stoi(sizeInput);
    }

    std::cout << "Sort by (id/first_name/last_name/patronymic_name/gender/phone/birth_date/region/created_at) [id]: ";
    std::getline(std::cin, request.sortBy);
    if (request.sortBy.empty()) {
        request.sortBy = "id";
    }

    std::cout << "Sort order (ASC/DESC) [ASC]: ";
    std::getline(std::cin, request.sortOrder);
    if (request.sortOrder.empty()) {
        request.sortOrder = "ASC";
    }

    std::cout << "Protocol Id: ";
    std::cin >> protocolId;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    try {
        auto response = clientUseCase_->getAllClientByProtocolId(request, protocolId, "");
        printClientList(response.items);
        printPaginationInfo(response);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ClientController::getAllClient()
{
    std::cout << "\n📋 GET ALL CLIENT" << std::endl;
    std::cout << "================" << std::endl;

    Common::PaginationRequest request;

    std::cout << "Page number [1]: ";
    std::string pageInput;
    std::getline(std::cin, pageInput);
    if (!pageInput.empty()) {
        request.page = std::stoi(pageInput);
    }

    std::cout << "Page size [10]: ";
    std::string sizeInput;
    std::getline(std::cin, sizeInput);
    if (!sizeInput.empty()) {
        request.pageSize = std::stoi(sizeInput);
    }

    std::cout << "Sort by (id/first_name/last_name/patronymic_name/gender/phone/birth_date/region/created_at) [id]: ";
    std::getline(std::cin, request.sortBy);
    if (request.sortBy.empty()) {
        request.sortBy = "id";
    }

    std::cout << "Sort order (ASC/DESC) [ASC]: ";
    std::getline(std::cin, request.sortOrder);
    if (request.sortOrder.empty()) {
        request.sortOrder = "ASC";
    }

    try {
        auto response = clientUseCase_->getAllClients(request, "");
        printClientList(response.items);
        printPaginationInfo(response);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ClientController::showMenu()
{
    std::cout << "\n" << std::string(50, '=') << std::endl;
    std::cout << "         NEVROCARDIOMED CLIENT MANAGEMENT" << std::endl;
    std::cout << std::string(50, '=') << std::endl;
    std::cout << "1. 🆕 Create Client" << std::endl;
    std::cout << "2. 🔍 Get Client by ID" << std::endl;
    std::cout << "3. 📱 Get Client by Phone" << std::endl;
    std::cout << "4. ✏️  Update Client" << std::endl;
    std::cout << "5. 🗑️  Delete Client" << std::endl;
    std::cout << "6. 📋 Get All Client" << std::endl;
    std::cout << "7. 📋 Get All Client By Protocol Id" << std::endl;
    std::cout << "0. 🚪 Back" << std::endl;
    std::cout << std::string(50, '=') << std::endl;
    std::cout << "Choice: ";
}

void ClientController::runInteractiveMode()
{
    int choice;

    while (true) {
        showMenu();
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        switch (choice) {
            case 1:
                createClient();
                break;
            case 2:
                getClientById();
                break;
            case 3:
                getClientByPhone();
                break;
            case 4:
                updateClient();
                break;
            case 5:
                deleteClient();
                break;
            case 6:
                getAllClient();
                break;
            case 7:
                getAllClientByProtocolId();
                break;
            case 0:
                std::cout << "\n👋 Dastur tugatildi!" << std::endl;
                return;
            default:
                std::cout << "\n❌ Noto'g'ri tanlov!" << std::endl;
        }
    }
    return;
}

}  // namespace Controller
