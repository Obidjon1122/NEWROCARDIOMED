#include "index.h"

#include <algorithm>
#include <iostream>
#include <regex>
#include "../../application/security.h"

namespace UseCase
{

UserUseCase::UserUseCase(std::unique_ptr<Repositories::UserRepository> userRepository)
    : userRepository_(std::move(userRepository))
{
}

bool UserUseCase::validateCreateRequest(const CreateUserRequest& request)
{
    if (request.firstName.empty() || request.firstName.length() > 20) {
        std::cerr << "[USECASE] First name xato (bo'sh yoki 20 dan ortiq)" << std::endl;
        return false;
    }

    if (request.lastName.empty() || request.lastName.length() > 20) {
        std::cerr << "[USECASE] Last name xato (bo'sh yoki 20 dan ortiq)" << std::endl;
        return false;
    }

    if (request.patronymicName.empty() || request.patronymicName.length() > 20) {
        std::cerr << "[USECASE] Patronymic name xato (bo'sh yoki 20 dan ortiq)" << std::endl;
        return false;
    }

    if (request.gender.empty() || (request.gender != "male" && request.gender != "female")) {
        std::cerr << "[USECASE] Gender xato (male yoki female)" << std::endl;
        return false;
    }

    if (!validatePassword(request.password)) {
        return false;
    }

    if (!validatePhone(request.phone)) {
        return false;
    }

    if (request.role != "admin" && request.role != "doctor") {
        std::cerr << "[USECASE] Role xato (admin, doctor bo'lishi kerak)" << std::endl;
        return false;
    }

    return true;
}

bool UserUseCase::validateUpdateRequest(const UpdateUserRequest& request)
{
    if (request.id <= 0) {
        std::cerr << "[USECASE] User ID xato" << std::endl;
        return false;
    }

    return validateCreateRequest({request.firstName, request.lastName, request.patronymicName, request.gender,
                                  request.password, request.phone, request.role});
}

bool UserUseCase::validatePhone(const std::string& phone)
{
    if (phone.empty() || phone.length() > 20) {
        return false;
    }

    std::regex phoneRegex(R"(^\+?\d{9,20}$)");
    if (!std::regex_match(phone, phoneRegex)) {
        return false;
    }

    return true;
}

bool UserUseCase::validatePassword(const std::string& password)
{
    if (password.length() < 6 || password.length() > 255) {
        return false;
    }

    return true;
}

std::shared_ptr<Domain::User> UserUseCase::createUser(const CreateUserRequest& request)
{
    std::cout << "[USECASE] User yaratish: " << request.firstName << " " << request.lastName << " "
              << request.patronymicName << std::endl;

    if (!validateCreateRequest(request)) {
        throw std::invalid_argument("Yaratish so'rovi xato");
    }

    if (phoneExists(request.phone)) {
        throw std::invalid_argument("Bu telefon raqami allaqachon mavjud");
    }

    Domain::User user(request.firstName, request.lastName, request.patronymicName, request.gender, request.password,
                      request.phone, request.role);

    const std::string hashedPassword = Security::hashPassword(request.password, request.phone);
    user.setPassword(hashedPassword);

    return userRepository_->create(user);
}

std::shared_ptr<Domain::User> UserUseCase::getUserById(int64_t id)
{
    if (id <= 0) {
        std::cerr << "[USECASE] User ID xato: " << id << std::endl;
        return nullptr;
    }

    return userRepository_->getById(id);
}

std::shared_ptr<Domain::User> UserUseCase::getUserByPhone(const std::string& phone)
{
    if (!validatePhone(phone)) {
        return nullptr;
    }

    return userRepository_->getByPhone(phone);
}

std::shared_ptr<Domain::User> UserUseCase::updateUser(const UpdateUserRequest& request)
{
    std::cout << "[USECASE] User yangilash: ID " << request.id << std::endl;

    if (!validateUpdateRequest(request)) {
        throw std::invalid_argument("Yangilash so'rovi xato");
    }

    if (!userExists(request.id)) {
        throw std::invalid_argument("User topilmadi");
    }

    auto existingUser = userRepository_->getByPhone(request.phone);
    if (existingUser && existingUser->getId() != request.id) {
        throw std::invalid_argument("Bu telefon raqami boshqa user tomonidan ishlatilmoqda");
    }

    Domain::User user;
    user.setId(request.id);
    user.setFirstName(request.firstName);
    user.setPatronymicName(request.patronymicName);
    user.setGender(request.gender);
    user.setLastName(request.lastName);
    user.setPassword(Security::hashPassword(request.password, request.phone));
    user.setPhone(request.phone);
    user.setRole(request.role);

    return userRepository_->update(user);
}

bool UserUseCase::deleteUser(int64_t id)
{
    std::cout << "[USECASE] User o'chirish: ID " << id << std::endl;

    if (id <= 0) {
        std::cerr << "[USECASE] User ID xato: " << id << std::endl;
        return false;
    }

    if (!userExists(id)) {
        std::cerr << "[USECASE] User topilmadi: ID " << id << std::endl;
        return false;
    }

    return userRepository_->deleteById(id);
}

Common::PaginationResponse<Domain::User> UserUseCase::getAllUsers(const Common::PaginationRequest& request)
{
    std::cout << "[USECASE] Users ro'yxati: Page " << request.page << ", Size " << request.pageSize << std::endl;

    if (request.page <= 0 || request.pageSize <= 0 || request.pageSize > 100) {
        throw std::invalid_argument("Pagination parametrlari xato");
    }

    return userRepository_->getAll(request);
}

std::vector<std::shared_ptr<Domain::User>> UserUseCase::getUsersByRole(const std::string& role)
{
    if (role != "admin" && role != "doctor") {
        throw std::invalid_argument("Role xato");
    }

    return userRepository_->getByRole(role);
}

Common::LoginResponse UserUseCase::loginUser(const std::string& phone, const std::string& password)
{
    Common::LoginResponse response;

    if (!validatePhone(phone)) {
        response.error        = true;
        response.errorMessage = "Вы ввели номер телефона в неправильном формате";
        return response;
    }

    if (!validatePassword(password)) {
        response.error        = true;
        response.errorMessage = "Пароль должен содержать не менее 6 символов";
        return response;
    }

    response = userRepository_->getLoginByPhone(phone);
    if (response.error) {
        response.errorMessage = "Пользователь с таким номером телефона не найден";
        return response;
    }

    const std::string hashedInput = Security::hashPassword(password, phone);

    // To avoid locking out legacy plaintext records, accept if stored hash equals raw password or hashed version.
    const std::string& stored = response.user->getPassword();
    const bool matches = (stored == hashedInput) || (stored == password);

    if (!matches) {
        response.error        = true;
        response.errorMessage = "Извините, но вы ввели неверный пароль. Пожалуйста, попробуйте ещё раз.";
        return response;
    }

    return response;
}

int UserUseCase::getTotalUsersCount()
{
    return userRepository_->getTotalCount();
}

bool UserUseCase::userExists(int64_t id)
{
    return userRepository_->existsById(id);
}

bool UserUseCase::phoneExists(const std::string& phone)
{
    return userRepository_->existsByPhone(phone);
}

}  // namespace UseCase
