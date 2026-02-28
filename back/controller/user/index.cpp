#include "index.h"

#include <iostream>
#include <limits>
#include <string>

namespace Controller
{

UserController::UserController(std::unique_ptr<UseCase::UserUseCase> userUseCase) : userUseCase_(std::move(userUseCase))
{
}

void UserController::printUserInfo(const std::shared_ptr<Domain::User>& user)
{
    std::cout << "\n┌──────────────────────────────────────┐" << std::endl;
    std::cout << "│               USER INFO              │" << std::endl;
    std::cout << "├──────────────────────────────────────┤" << std::endl;
    std::cout << "│ ID      : " << user->getId() << std::endl;
    std::cout << "│ Name    : " << user->getFullName() << std::endl;
    std::cout << "│ Gender    : " << user->getGender() << std::endl;
    std::cout << "│ Phone   : " << user->getPhone() << std::endl;
    std::cout << "│ Role    : " << user->getRole() << std::endl;
    std::cout << "│ Created : " << user->getCreatedAt() << std::endl;
    std::cout << "│ Updated : " << user->getUpdatedAt() << std::endl;
    std::cout << "└──────────────────────────────────────┘" << std::endl;
}

void UserController::printPaginationInfo(const Common::PaginationResponse<Domain::User>& response)
{
    std::cout << "\n📄 PAGINATION INFO:" << std::endl;
    std::cout << "   Current Page: " << response.currentPage << std::endl;
    std::cout << "   Page Size: " << response.pageSize << std::endl;
    std::cout << "   Total Count: " << response.totalCount << std::endl;
    std::cout << "   Total Pages: " << response.totalPages << std::endl;
    std::cout << "   Has Next: " << (response.hasNext ? "Yes" : "No") << std::endl;
    std::cout << "   Has Previous: " << (response.hasPrevious ? "Yes" : "No") << std::endl;
    std::cout << "   Users on this page: " << response.items.size() << std::endl;
}

void UserController::printUserList(const std::vector<std::shared_ptr<Domain::User>>& users)
{
    std::cout << "\n👥 USERS LIST (" << users.size() << " users):" << std::endl;
    std::cout << "┌────┬──────────────────────┬──────────┬──────────────────┬──────────┐" << std::endl;
    std::cout << "│ ID │        NAME          │  GENDER  │      PHONE       │   ROLE   │" << std::endl;
    std::cout << "├────┼──────────────────────┼──────────┼──────────────────┼──────────┤" << std::endl;

    for (const auto& user : users) {
        auto idStr  = std::to_string(user->getId());
        auto name   = user->getFullName();
        auto gender = user->getGender();
        auto phone  = user->getPhone();
        auto role   = user->getRole();

        auto pad = [](const std::string& s, size_t width) {
            if (s.size() >= width)
                return s.substr(0, width);
            return s + std::string(width - s.size(), ' ');
        };

        std::cout << "│ " << pad(idStr, 2) << " │ " << pad(name, 20) << " │ " << pad(gender, 8) << " │ "
                  << pad(phone, 16) << " │ " << pad(role, 8) << " │" << std::endl;
    }

    std::cout << "└────┴──────────────────────┴──────────┴──────────────────┴──────────┘" << std::endl;
}

void UserController::createUser()
{
    std::cout << "\n🆕 CREATE NEW USER" << std::endl;
    std::cout << "=====================" << std::endl;

    UseCase::CreateUserRequest request;

    std::cout << "First Name: ";
    std::getline(std::cin, request.firstName);

    std::cout << "Last Name: ";
    std::getline(std::cin, request.lastName);

    std::cout << "Patronymic Name: ";
    std::getline(std::cin, request.patronymicName);

    std::cout << "Gender (male/female): ";
    std::getline(std::cin, request.gender);

    std::cout << "Password: ";
    std::getline(std::cin, request.password);

    std::cout << "Phone: ";
    std::getline(std::cin, request.phone);

    std::cout << "Role: ";
    std::getline(std::cin, request.role);

    try {
        auto user = userUseCase_->createUser(request);
        std::cout << "\n✅ User muvaffaqiyatli yaratildi!" << std::endl;
        printUserInfo(user);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void UserController::getUserById()
{
    std::cout << "\n🔍 GET USER BY ID" << std::endl;
    std::cout << "=================" << std::endl;

    int64_t id;
    std::cout << "User ID: ";
    std::cin >> id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    try {
        auto user = userUseCase_->getUserById(id);
        if (user) {
            std::cout << "\n✅ User topildi!" << std::endl;
            printUserInfo(user);
        }
        else {
            std::cout << "\n❌ User topilmadi (ID: " << id << ")" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void UserController::getUserByPhone()
{
    std::cout << "\n📱 GET USER BY PHONE" << std::endl;
    std::cout << "===================" << std::endl;

    std::string phone;
    std::cout << "Phone: ";
    std::getline(std::cin, phone);

    try {
        auto user = userUseCase_->getUserByPhone(phone);
        if (user) {
            std::cout << "\n✅ User topildi!" << std::endl;
            printUserInfo(user);
        }
        else {
            std::cout << "\n❌ User topilmadi (Phone: " << phone << ")" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void UserController::updateUser()
{
    std::cout << "\n✏️ UPDATE USER" << std::endl;
    std::cout << "==============" << std::endl;

    UseCase::UpdateUserRequest request;

    std::cout << "User ID: ";
    std::cin >> request.id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    std::cout << "First Name: ";
    std::getline(std::cin, request.firstName);

    std::cout << "Last Name: ";
    std::getline(std::cin, request.lastName);

    std::cout << "Patronymic Name: ";
    std::getline(std::cin, request.patronymicName);

    std::cout << "Gender (male/female): ";
    std::getline(std::cin, request.gender);

    std::cout << "Password: ";
    std::getline(std::cin, request.password);

    std::cout << "Phone: ";
    std::getline(std::cin, request.phone);

    std::cout << "Role: ";
    std::getline(std::cin, request.role);

    try {
        auto user = userUseCase_->updateUser(request);
        std::cout << "\n✅ User muvaffaqiyatli yangilandi!" << std::endl;
        printUserInfo(user);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void UserController::deleteUser()
{
    std::cout << "\n🗑️ DELETE USER" << std::endl;
    std::cout << "===============" << std::endl;

    int64_t id;
    std::cout << "User ID: ";
    std::cin >> id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    std::cout << "Rostdan ham o'chirmoqchimisiz? (y/n): ";
    char confirm;
    std::cin >> confirm;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    if (confirm == 'y' || confirm == 'Y') {
        try {
            bool deleted = userUseCase_->deleteUser(id);
            if (deleted) {
                std::cout << "\n✅ User muvaffaqiyatli o'chirildi!" << std::endl;
            }
            else {
                std::cout << "\n❌ User o'chirilmadi" << std::endl;
            }
        } catch (const std::exception& e) {
            std::cout << "\n❌ Xato: " << e.what() << std::endl;
        }
    }
    else {
        std::cout << "\n❌ Operatsiya bekor qilindi" << std::endl;
    }
}

void UserController::getAllUsers()
{
    std::cout << "\n📋 GET ALL USERS" << std::endl;
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

    std::cout << "Sort by (id/first_name/last_name/gender/phone/role/created_at) [id]: ";
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
        auto response = userUseCase_->getAllUsers(request);
        printUserList(response.items);
        printPaginationInfo(response);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void UserController::getUsersByRole()
{
    std::cout << "\n👔 GET USERS BY ROLE" << std::endl;
    std::cout << "===================" << std::endl;

    std::string role;
    std::cout << "Role: ";
    std::getline(std::cin, role);

    try {
        auto users = userUseCase_->getUsersByRole(role);
        printUserList(users);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void UserController::showMenu()
{
    std::cout << "\n" << std::string(50, '=') << std::endl;
    std::cout << "         NEVROCARDIOMED USER MANAGEMENT" << std::endl;
    std::cout << std::string(50, '=') << std::endl;
    std::cout << "1. 🆕 Create User" << std::endl;
    std::cout << "2. 🔍 Get User by ID" << std::endl;
    std::cout << "3. 📱 Get User by Phone" << std::endl;
    std::cout << "4. ✏️  Update User" << std::endl;
    std::cout << "5. 🗑️  Delete User" << std::endl;
    std::cout << "6. 📋 Get All Users" << std::endl;
    std::cout << "7. 👔 Get Users by Role" << std::endl;
    std::cout << "0. 🚪 Back" << std::endl;
    std::cout << std::string(50, '=') << std::endl;
    std::cout << "Choice: ";
}

void UserController::runInteractiveMode()
{
    int choice;

    while (true) {
        showMenu();
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        switch (choice) {
            case 1:
                createUser();
                break;
            case 2:
                getUserById();
                break;
            case 3:
                getUserByPhone();
                break;
            case 4:
                updateUser();
                break;
            case 5:
                deleteUser();
                break;
            case 6:
                getAllUsers();
                break;
            case 7:
                getUsersByRole();
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
