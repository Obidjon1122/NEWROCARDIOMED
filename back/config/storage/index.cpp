#include "index.h"

#include <cstdlib>
#include <iostream>
#include <sstream>

namespace Config
{
namespace Storage
{

DatabaseConfig::DatabaseConfig()
{
    // Environment variables dan o'qish, agar yo'q bo'lsa default qiymat
    const char* dbHost     = std::getenv("DB_HOST");
    const char* dbPort     = std::getenv("DB_PORT");
    const char* dbName     = std::getenv("DB_NAME");
    const char* dbUser     = std::getenv("DB_USER");
    const char* dbPassword = std::getenv("DB_PASSWORD");
    const char* dbSslMode  = std::getenv("DB_SSL_MODE");

    config_["DB_HOST"]     = dbHost ? dbHost : "localhost";
    config_["DB_PORT"]     = dbPort ? dbPort : "5432";
    config_["DB_NAME"]     = dbName ? dbName : "Nevrocardiomed";
    config_["DB_USER"]     = dbUser ? dbUser : "turnerko";
    config_["DB_PASSWORD"] = dbPassword ? dbPassword : "2002";
    config_["DB_SSL_MODE"] = dbSslMode ? dbSslMode : "disable";

    if (config_["DB_USER"].empty() || config_["DB_PASSWORD"].empty()) {
        std::cerr << "[CONFIG] ⚠️ DB_USER/DB_PASSWORD topilmadi. Iltimos, .env orqali sozlang.\n";
    }
}

std::string DatabaseConfig::getHost() const
{
    auto it = config_.find("DB_HOST");
    return (it != config_.end() && !it->second.empty()) ? it->second : "localhost";
}

int DatabaseConfig::getPort() const
{
    auto it = config_.find("DB_PORT");
    if (it != config_.end() && !it->second.empty()) {
        return std::stoi(it->second);
    }
    return 5432;
}

std::string DatabaseConfig::getDatabase() const
{
    auto it = config_.find("DB_NAME");
    return (it != config_.end() && !it->second.empty()) ? it->second : "Nevrocardiomed";
}

std::string DatabaseConfig::getUsername() const
{
    auto it = config_.find("DB_USER");
    return (it != config_.end() && !it->second.empty()) ? it->second : "";
}

std::string DatabaseConfig::getPassword() const
{
    auto it = config_.find("DB_PASSWORD");
    return (it != config_.end() && !it->second.empty()) ? it->second : "";
}

std::string DatabaseConfig::getSslMode() const
{
    auto it = config_.find("DB_SSL_MODE");
    return (it != config_.end() && !it->second.empty()) ? it->second : "disable";
}

std::string DatabaseConfig::getConnectionString() const
{
    std::stringstream ss;
    ss << "host=" << getHost() << " port=" << getPort() << " dbname=" << getDatabase() << " user=" << getUsername()
       << " password=" << getPassword() << " sslmode=" << getSslMode();
    return ss.str();
}

void DatabaseConfig::printConfig() const
{
    std::cout << "[CONFIG] Database konfiguratsiyasi:" << std::endl;
    std::cout << "  Host: " << getHost() << std::endl;
    std::cout << "  Port: " << getPort() << std::endl;
    std::cout << "  Database: " << getDatabase() << std::endl;
    std::cout << "  Username: " << getUsername() << std::endl;
    std::cout << "  SSL Mode: " << getSslMode() << std::endl;
}

}  // namespace Storage
}  // namespace Config
