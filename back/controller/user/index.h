#ifndef CONTROLLER_USER_CONTROLLER_H
#define CONTROLLER_USER_CONTROLLER_H

#include "../../usecase/user/index.h"
#include <memory>

namespace Controller
{

class UserController
{
   private:
    std::unique_ptr<UseCase::UserUseCase> userUseCase_;

    void printUserInfo(const std::shared_ptr<Domain::User>& user);
    void printPaginationInfo(const Common::PaginationResponse<Domain::User>& response);
    void printUserList(const std::vector<std::shared_ptr<Domain::User>>& users);

   public:
    explicit UserController(std::unique_ptr<UseCase::UserUseCase> userUseCase);

    void createUser();
    void getUserById();
    void getUserByPhone();
    void updateUser();
    void deleteUser();
    void getAllUsers();
    void getUsersByRole();

    void showMenu();
    void runInteractiveMode();
};

}  // namespace Controller

#endif  // CONTROLLER_USER_CONTROLLER_H