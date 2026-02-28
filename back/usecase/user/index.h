#ifndef USECASE_USER_USECASE_H
#define USECASE_USER_USECASE_H

#include "../../domain/user/index.h"
#include "../../repository/user/index.h"

namespace UseCase
{

struct CreateUserRequest {
    std::string firstName;
    std::string lastName;
    std::string patronymicName;
    std::string gender;
    std::string password;
    std::string phone;
    std::string role = "admin";
};

struct UpdateUserRequest {
    int64_t     id;
    std::string firstName;
    std::string lastName;
    std::string patronymicName;
    std::string gender;
    std::string password;
    std::string phone;
    std::string role;
};

class UserUseCase
{
   private:
    std::unique_ptr<Repositories::UserRepository> userRepository_;

    bool validateCreateRequest(const CreateUserRequest& request);
    bool validateUpdateRequest(const UpdateUserRequest& request);

   public:
    explicit UserUseCase(std::unique_ptr<Repositories::UserRepository> userRepository);

    std::shared_ptr<Domain::User> createUser(const CreateUserRequest& request);
    std::shared_ptr<Domain::User> getUserById(int64_t id);
    std::shared_ptr<Domain::User> getUserByPhone(const std::string& phone);
    std::shared_ptr<Domain::User> updateUser(const UpdateUserRequest& request);
    bool                          deleteUser(int64_t id);

    Common::PaginationResponse<Domain::User>   getAllUsers(const Common::PaginationRequest& request);
    std::vector<std::shared_ptr<Domain::User>> getUsersByRole(const std::string& role);
    Common::LoginResponse                      loginUser(const std::string& phone, const std::string& password);

    int  getTotalUsersCount();
    bool userExists(int64_t id);
    bool phoneExists(const std::string& phone);

    bool validatePhone(const std::string& phone);
    bool validatePassword(const std::string& password);
};

}  // namespace UseCase

#endif  // USECASE_USER_USECASE_H
