#include "index.h"

#include <iostream>
#include <limits>
#include <string>

namespace Controller
{

ProtocolController::ProtocolController(std::unique_ptr<UseCase::ProtocolUseCase> userUseCase)
    : protocolUseCase_(std::move(userUseCase))
{
}

void ProtocolController::printProtocolInfo(const std::shared_ptr<Domain::Protocol>& protocol)
{
    std::cout << "\n┌──────────────────────────────────────────────┐" << std::endl;
    std::cout << "│               🧾 PROTOCOL INFO               │" << std::endl;
    std::cout << "├──────────────────────────────────────────────┤" << std::endl;
    std::cout << "│ ID         : " << protocol->getId() << std::endl;
    std::cout << "│ Title      : " << protocol->getTitle() << std::endl;
    std::cout << "│ Doctor ID  : " << protocol->getDoctorId() << std::endl;
    std::cout << "│ Created At : " << protocol->getCreatedAt() << std::endl;
    std::cout << "│ Updated At : " << protocol->getUpdatedAt() << std::endl;
    std::cout << "├──────────────────────────────────────────────┤" << std::endl;
    std::cout << "│ Protocol Form:" << std::endl;

    const auto& form = protocol->getProtocolForm();
    if (form.empty()) {
        std::cout << "│   (empty)" << std::endl;
    }
    else {
        for (const auto& [key, values] : form) {
            std::cout << "│   " << key << ": [";
            for (size_t i = 0; i < values.size(); ++i) {
                std::cout << values[i];
                if (i < values.size() - 1)
                    std::cout << ", ";
            }
            std::cout << "]" << std::endl;
        }
    }

    std::cout << "└──────────────────────────────────────────────┘" << std::endl;
}

void ProtocolController::printProtocolList(const Common::ProtocolDashboardResponse& response)
{
    const auto& protocols = response.items;

    std::cout << "\n👥 PROTOCOLS LIST (" << protocols.size() << " items):" << std::endl;
    std::cout << "┌────┬──────────────────────────────────────────────┐" << std::endl;
    std::cout << "│ ID │                   TITLE                      │" << std::endl;
    std::cout << "├────┼──────────────────────────────────────────────┤" << std::endl;

    auto wrapText = [](const std::string& text, size_t width) {
        std::vector<std::string> lines;
        for (size_t i = 0; i < text.size(); i += width)
            lines.push_back(text.substr(i, width));
        return lines;
    };

    for (const auto& protocol : protocols) {
        std::string idStr = std::to_string(protocol.protocolId);
        std::string title = protocol.protocolTitle;

        auto wrappedTitle = wrapText(title, 46);
        bool firstLine    = true;

        for (const auto& line : wrappedTitle) {
            if (firstLine) {
                std::cout << "│ " << idStr << std::string(3 - idStr.size(), ' ') << " │ " << line
                          << std::string(46 - line.size(), ' ') << " │" << std::endl;
                firstLine = false;
            }
            else {
                // Keyingi qatorlarda ID o‘rniga bo‘sh joy
                std::cout << "│    │ " << line << std::string(46 - line.size(), ' ') << " │" << std::endl;
            }
        }
    }

    std::cout << "└────┴──────────────────────────────────────────────┘" << std::endl;
}

void ProtocolController::printProtocolIdAndClientId(const Common::ProtocolFormsResponse& response)
{
    const auto& protocols = response.items;

    std::cout << "\n📋 PROTOCOL FORMS LIST (" << protocols.size() << " items):" << std::endl;
    std::cout << "┌───────────────┬───────────────────────────────┐" << std::endl;
    std::cout << "│   FORM ID     │        CREATED AT             │" << std::endl;
    std::cout << "├───────────────┼───────────────────────────────┤" << std::endl;

    for (const auto& protocol : protocols) {
        std::string idStr     = std::to_string(protocol.protocolFormId);
        std::string createdAt = protocol.protocolTitle;

        // Max uzunliklar
        const size_t idWidth   = 13;
        const size_t dateWidth = 100;

        // Jadvalni formatlash
        std::cout << "│ " << idStr << std::string(idWidth - idStr.size(), ' ') << " │ " << createdAt
                  << std::string(dateWidth - createdAt.size(), ' ') << " │" << std::endl;
    }

    std::cout << "└───────────────┴───────────────────────────────┘" << std::endl;
}

void ProtocolController::getProtocolById()
{
    std::cout << "\n🔍 GET Protocol BY ID" << std::endl;
    std::cout << "=================" << std::endl;

    int64_t id;
    std::cout << "Protocol ID: ";
    std::cin >> id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    try {
        auto protocol = protocolUseCase_->getProtocolById(id);
        if (protocol) {
            std::cout << "\n✅ Protocol topildi!" << std::endl;
            printProtocolInfo(protocol);
        }
        else {
            std::cout << "\n❌ Protocol topilmadi (ID: " << id << ")" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ProtocolController::getAllByDoctorId()
{
    std::cout << "\n📋 GET ALL Protocol" << std::endl;
    std::cout << "================" << std::endl;

    int64_t id;
    std::cout << "Doctor ID: ";
    std::cin >> id;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    try {
        auto response = protocolUseCase_->getAllByDoctorId(id);
        printProtocolList(response);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ProtocolController::getProtocolIdAndClientId()
{
    std::cout << "\n📋 GET ALL ProtocolID and ClientID" << std::endl;
    std::cout << "================" << std::endl;

    Common::PaginationRequest request;

    int64_t protocolId;
    std::cout << "Protocol ID: ";
    std::cin >> protocolId;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    int64_t clientId;
    std::cout << "Client ID: ";
    std::cin >> clientId;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    try {
        auto response = protocolUseCase_->getProtocolIdAndClientId(request, clientId, protocolId);
        printProtocolIdAndClientId(response);
    } catch (const std::exception& e) {
        std::cout << "\n❌ Xato: " << e.what() << std::endl;
    }
}

void ProtocolController::showMenu()
{
    std::cout << "\n" << std::string(50, '=') << std::endl;
    std::cout << "         NEVROCARDIOMED Protocol MANAGEMENT" << std::endl;
    std::cout << std::string(50, '=') << std::endl;
    std::cout << "1. 👔 Get All Protocol By Doctor Id" << std::endl;
    std::cout << "2. 📋 Get Protocol By Id" << std::endl;
    std::cout << "3. 📋 Get Protocol By Id And Client Id" << std::endl;
    std::cout << "0. 🚪 Back" << std::endl;
    std::cout << std::string(50, '=') << std::endl;
    std::cout << "Choice: ";
}

void ProtocolController::runInteractiveMode()
{
    int choice;

    while (true) {
        showMenu();
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        switch (choice) {
            case 1:
                getAllByDoctorId();
                break;
            case 2:
                getProtocolById();
                break;
            case 3:
                getProtocolIdAndClientId();
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
