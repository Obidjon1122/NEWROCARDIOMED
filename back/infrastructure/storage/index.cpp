#include "index.h"

#include <exception>
#include <iostream>

namespace Infrastructure
{
namespace Storage
{

DatabaseConnection::DatabaseConnection() : isConnected_(false)
{
    std::cout << "[DB] DatabaseConnection yaratilmoqda..." << std::endl;
}

DatabaseConnection::~DatabaseConnection()
{
    disconnect();
    std::cout << "[DB] DatabaseConnection yo'q qilindi" << std::endl;
}

bool DatabaseConnection::connect()
{
    try {
        std::cout << "[DB] PostgreSQL'ga ulanish..." << std::endl;
        std::string connectionString = config_.getConnectionString();
        std::cout << "[DB] Connection string: " << connectionString << std::endl;
        connection_ = std::make_unique<pqxx::connection>(connectionString);
        if (connection_->is_open()) {
            isConnected_ = true;
            std::cout << "[DB] PostgreSQL'ga muvaffaqiyatli ulanildi!" << std::endl;
            return true;
        }
        else {
            std::cerr << "[DB] PostgreSQL'ga ulanib bo'lmadi" << std::endl;
            return false;
        }
    } catch (const std::exception& e) {
        std::cerr << "[DB] PostgreSQL ulanish xatosi: " << e.what() << std::endl;
        isConnected_ = false;
        return false;
    }
}

void DatabaseConnection::disconnect()
{
    if (connection_ && connection_->is_open()) {
        connection_.reset();
        std::cout << "[DB] PostgreSQL aloqasi uzildi" << std::endl;
    }
    isConnected_ = false;
}

bool DatabaseConnection::isConnected() const
{
    return isConnected_ && connection_ && connection_->is_open();
}

pqxx::connection* DatabaseConnection::getConnection()
{
    return connection_.get();
}

void DatabaseConnection::printConnectionInfo() const
{
    std::cout << "[DB] Connection ma'lumotlari:" << std::endl;
    std::cout << "  Status: " << (isConnected() ? "Ulangan" : "Ulanmagan") << std::endl;
    if (connection_) {
        std::cout << "  Database: " << connection_->dbname() << std::endl;
        std::cout << "  Username: " << connection_->username() << std::endl;
        std::cout << "  Host: " << connection_->hostname() << std::endl;
        std::cout << "  Port: " << connection_->port() << std::endl;
    }
}

}  // namespace Storage
}  // namespace Infrastructure