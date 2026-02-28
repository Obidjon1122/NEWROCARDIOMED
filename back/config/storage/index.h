#ifndef CONFIG_STORAGE_INDEX_H
#define CONFIG_STORAGE_INDEX_H

#include <map>
#include <string>

namespace Config
{
namespace Storage
{

class DatabaseConfig
{
   private:
    std::map<std::string, std::string> config_;

   public:
    DatabaseConfig();
    int         getPort() const;
    std::string getHost() const;
    std::string getDatabase() const;
    std::string getUsername() const;
    std::string getPassword() const;
    std::string getSslMode() const;
    std::string getConnectionString() const;
    void        printConfig() const;
};

}  // namespace Storage
}  // namespace Config

#endif  // CONFIG_STORAGE_INDEX_H