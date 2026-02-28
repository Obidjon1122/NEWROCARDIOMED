cmake_minimum_required(VERSION 3.19)
project(NEVROCARDIOMED VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(nlohmann_json CONFIG REQUIRED)

# libpqxx: use pkg-config fallback (Homebrew does not ship CMake config)
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBPQXX REQUIRED libpqxx)
find_package(OpenSSL REQUIRED)

# Include papkalar
include_directories(${CMAKE_SOURCE_DIR})
include_directories(${LIBPQXX_INCLUDE_DIRS})
link_directories(${LIBPQXX_LIBRARY_DIRS})

# Fayllarni qatlamlar bo'yicha ajratish
set(CONFIG_SOURCES
    config/storage/index.cpp
)

set(APPLICATION_SOURCES
    application/index.cpp
    application/security.cpp
)

set(INFRASTRUCTURE_SOURCES
    infrastructure/storage/index.cpp
)

set(DOMAIN_USER_SOURCES
    domain/user/index.cpp
)
set(DOMAIN_CLIENT_SOURCES
    domain/client/index.cpp
)
set(DOMAIN_PROTOCOL_SOURCES
    domain/protocol/index.cpp
)

set(REPOSITORY_USER_SOURCES
    repository/user/index.cpp
)
set(REPOSITORY_CLIENT_SOURCES
    repository/client/index.cpp
)
set(REPOSITORY_PROTOCOL_SOURCES
    repository/protocol/index.cpp
)

set(USECASE_USER_SOURCES
    usecase/user/index.cpp
)
set(USECASE_CLIENT_SOURCES
    usecase/client/index.cpp
)
set(USECASE_PROTOCOL_SOURCES
    usecase/protocol/index.cpp
)

set(CONTROLLER_USER_SOURCES
    controller/user/index.cpp
)
set(CONTROLLER_CLIENT_SOURCES
    controller/client/index.cpp
)
set(CONTROLLER_PROTOCOL_SOURCES
    controller/protocol/index.cpp
)

# Asosiy executable fayl
add_executable(nevrocardiomed 
    main.cpp
    ${APPLICATION_SOURCES}
    ${CONFIG_SOURCES}
    ${INFRASTRUCTURE_SOURCES}

    ${DOMAIN_USER_SOURCES}
    ${DOMAIN_CLIENT_SOURCES}
    ${DOMAIN_PROTOCOL_SOURCES}
    
    ${REPOSITORY_USER_SOURCES}
    ${REPOSITORY_CLIENT_SOURCES}
    ${REPOSITORY_PROTOCOL_SOURCES}

    ${USECASE_USER_SOURCES}
    ${USECASE_CLIENT_SOURCES}
    ${USECASE_PROTOCOL_SOURCES}

    ${CONTROLLER_USER_SOURCES}
    ${CONTROLLER_CLIENT_SOURCES}
    ${CONTROLLER_PROTOCOL_SOURCES}
)

# Kutubxonalarni bog'lash
target_link_libraries(nevrocardiomed PRIVATE
    nlohmann_json::nlohmann_json
    ${LIBPQXX_LIBRARIES}
    OpenSSL::Crypto
    # Agar libsodium kerak bo'lsa:
    # unofficial-sodium::sodium
)

# C++ 17 qo'llab-quvvatlash
target_compile_features(nevrocardiomed PRIVATE cxx_std_20)

# Format target (Windows uchun PowerShell yoki Git Bash kerak)
add_custom_target(format
    COMMAND ${CMAKE_COMMAND} -E echo "Running clang-format on all .cpp and .h files..."
    COMMAND powershell -Command "Get-ChildItem -Recurse -Include *.cpp,*.h | ForEach-Object { clang-format -i $_.FullName }"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Format all source files using clang-format"
)
