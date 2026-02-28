#include "controller/client/index.h"
#include "controller/protocol/index.h"
#include "controller/user/index.h"
#include "infrastructure/storage/index.h"
#include "repository/client/index.h"
#include "repository/protocol/index.h"
#include "repository/user/index.h"
#include "usecase/client/index.h"
#include "usecase/protocol/index.h"
#include "usecase/user/index.h"
#include <iostream>
#include <memory>

void printHeader()
{
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "              NEVROCARDIOMED SYSTEM" << std::endl;
    std::cout << "           Clean Architecture Demo" << std::endl;
    std::cout << std::string(60, '=') << std::endl;
}

int main()
{
    printHeader();

    try {
        std::cout << "\n[MAIN] Database'ga ulanish..." << std::endl;
        auto dbConnection = std::make_unique<Infrastructure::Storage::DatabaseConnection>();

        if (!dbConnection->connect()) {
            std::cerr << "[MAIN] Database'ga ulanish xatosi!" << std::endl;
            return 1;
        }

        std::cout << "[MAIN] ✅ Database ulandi" << std::endl;

        std::cout << "\n[MAIN] Clean Architecture qatlamlarini yaratish..." << std::endl;

        auto userRepository     = std::make_unique<Repositories::UserRepository>(dbConnection.get());
        auto clientRepository   = std::make_unique<Repositories::ClientRepository>(dbConnection.get());
        auto protocolRepository = std::make_unique<Repositories::ProtocolRepository>(dbConnection.get());

        auto userUseCase     = std::make_unique<UseCase::UserUseCase>(std::move(userRepository));
        auto clientUseCase   = std::make_unique<UseCase::ClientUseCase>(std::move(clientRepository));
        auto protocolUseCase = std::make_unique<UseCase::ProtocolUseCase>(std::move(protocolRepository));

        auto userController     = std::make_unique<Controller::UserController>(std::move(userUseCase));
        auto clientController   = std::make_unique<Controller::ClientController>(std::move(clientUseCase));
        auto protocolController = std::make_unique<Controller::ProtocolController>(std::move(protocolUseCase));

        std::cout << "[MAIN] ✅ Barcha qatlamlar tayyor" << std::endl;

        std::cout << "\n[MAIN] 🚀 Interaktiv rejim boshlandi!" << std::endl;

        int choice;
        while (true) {
            std::cout << "\n" << std::string(50, '=') << std::endl;
            std::cout << "         NEVROCARDIOMED" << std::endl;
            std::cout << std::string(50, '=') << std::endl;
            std::cout << "1. 🆕 Operation User" << std::endl;
            std::cout << "2. 🆕 Operation Client" << std::endl;
            std::cout << "3. 🆕 Operation Protocol" << std::endl;
            std::cout << "0. 🚪 Exit" << std::endl;
            std::cout << std::string(50, '=') << std::endl;
            std::cout << "Choice: ";

            std::cin >> choice;
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

            switch (choice) {
                case 1:
                    userController->runInteractiveMode();
                    break;
                case 2:
                    clientController->runInteractiveMode();
                    break;
                case 3:
                    protocolController->runInteractiveMode();
                    break;
                case 0:
                    std::cout << "\n👋 Dastur tugatildi!" << std::endl;
                    return 0;
                default:
                    std::cout << "\n❌ Noto'g'ri tanlov!" << std::endl;
            }
        }

    } catch (const std::exception& e) {
        std::cerr << "\n[MAIN] Umumiy xato: " << e.what() << std::endl;
        return 1;
    }

    std::cout << "\n[MAIN] Dastur yakunlandi!" << std::endl;
    return 0;
}
