cmake_minimum_required(VERSION 3.19)
project(front LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# =====================[ ICON Resursi ]=====================
set(ICON_FILE "")
if(WIN32)
    set(APP_ICON_RESOURCE_WINDOWS "${CMAKE_CURRENT_SOURCE_DIR}/appicon.rc")
    if(EXISTS ${APP_ICON_RESOURCE_WINDOWS})
        set(ICON_FILE ${APP_ICON_RESOURCE_WINDOWS})
        message(STATUS "✅ Icon resursi topildi: ${APP_ICON_RESOURCE_WINDOWS}")
    else()
        message(WARNING "⚠️ appicon.rc topilmadi, icon qo'shilmaydi")
    endif()
endif()

# =====================[ QT6 Kutubxonalar ]=====================
find_package(Qt6 REQUIRED COMPONENTS
    Core
    Gui
    Widgets
    PrintSupport
    Pdf
    PdfWidgets
    WebEngineCore
    WebEngineWidgets
)

qt_standard_project_setup()

# =====================[ PostgreSQL va libpqxx ]=====================
find_package(PostgreSQL REQUIRED)
find_package(OpenSSL REQUIRED)

# Mac (Homebrew) va Windows (vcpkg) uchun
if(APPLE)
    find_path(PQXX_INCLUDE_DIR pqxx/pqxx
        HINTS
            /opt/homebrew/include
            /usr/local/include
    )
    find_library(PQXX_LIBRARY pqxx
        HINTS
            /opt/homebrew/lib
            /usr/local/lib
    )
    find_path(NLOHMANN_JSON_INCLUDE_DIR nlohmann/json.hpp
        HINTS
            /opt/homebrew/include
            /usr/local/include
    )
else()
    find_path(PQXX_INCLUDE_DIR pqxx/pqxx
        HINTS
            $ENV{PQXX_ROOT}/include
            "C:/vcpkg/installed/x64-windows/include"
    )
    find_library(PQXX_LIBRARY pqxx
        HINTS
            $ENV{PQXX_ROOT}/lib
            "C:/vcpkg/installed/x64-windows/lib"
    )
    find_path(NLOHMANN_JSON_INCLUDE_DIR nlohmann/json.hpp
        HINTS
            "C:/vcpkg/installed/x64-windows/include"
    )
endif()

if(NOT PQXX_INCLUDE_DIR OR NOT PQXX_LIBRARY)
    message(FATAL_ERROR "❌ libpqxx topilmadi!")
endif()

if(NOT NLOHMANN_JSON_INCLUDE_DIR)
    message(FATAL_ERROR "❌ nlohmann-json topilmadi!")
endif()

# =====================[ INCLUDE YO'LLAR ]=====================
include_directories(
    ${PQXX_INCLUDE_DIR}
    ${PostgreSQL_INCLUDE_DIRS}
    ${NLOHMANN_JSON_INCLUDE_DIR}
    ${CMAKE_SOURCE_DIR}/../back
    ${CMAKE_SOURCE_DIR}/../back/domain
    ${CMAKE_SOURCE_DIR}/../back/usecase
    ${CMAKE_SOURCE_DIR}/../back/repository
    ${CMAKE_SOURCE_DIR}/../back/infrastructure
    ${CMAKE_SOURCE_DIR}/../back/application
    ${CMAKE_SOURCE_DIR}/../back/config
)

# =====================[ Asosiy Executable ]=====================
qt_add_executable(front
    main.cpp
    ${ICON_FILE}
    ../back/config/storage/index.cpp
    ../back/config/storage/index.h
    ../back/domain/client/index.cpp
    ../back/domain/client/index.h
    ../back/domain/common/index.h
    ../back/domain/user/index.cpp
    ../back/domain/user/index.h
    ../back/domain/protocol/index.cpp
    ../back/domain/protocol/index.h
    ../back/domain/protocol_template/index.cpp
    ../back/domain/protocol_template/index.h
    ../back/infrastructure/storage/index.cpp
    ../back/infrastructure/storage/index.h
    ../back/repository/client/index.cpp
    ../back/repository/client/index.h
    ../back/repository/user/index.cpp
    ../back/repository/user/index.h
    ../back/repository/protocol/index.cpp
    ../back/repository/protocol/index.h
    ../back/repository/protocol_template/index.cpp
    ../back/repository/protocol_template/index.h
    ../back/usecase/client/index.cpp
    ../back/usecase/client/index.h
    ../back/usecase/user/index.cpp
    ../back/usecase/user/index.h
    ../back/usecase/protocol/index.cpp
    ../back/usecase/protocol/index.h
    ../back/usecase/protocol_template/index.cpp
    ../back/usecase/protocol_template/index.h
    ../back/application/index.cpp
    ../back/application/index.h
    ../back/application/security.cpp
    ../back/application/security.h

    allpages.h allpages.cpp allpages.ui
    src/clientform/clientform.h src/clientform/clientform.cpp src/clientform/clientform.ui
    src/protocolchose/protocolchose.h src/protocolchose/protocolchose.cpp src/protocolchose/protocolchose.ui
    src/calendar/searchcalendardilalog.h src/calendar/searchcalendardilalog.cpp src/calendar/searchcalendardilalog.ui
    src/clientparts/clientparts.h src/clientparts/clientparts.cpp
    src/utils.h src/utils.cpp
    src/protocolparts/protocolparts.h src/protocolparts/protocolparts.cpp
    src/protocolforms/protocolforms.h src/protocolforms/protocolforms.cpp
    src/templatebuilder/templatebuilder.h src/templatebuilder/templatebuilder.cpp
)

# =====================[ ICON Resurslari ]=====================
qt_add_resources(front "media"
    PREFIX "/icons"
    FILES
        media/icons/home_1.png
        media/icons/home_2.png
        media/icons/male_doctor.png
        media/icons/female_doctor.png
        media/icons/pharmacy.png
        media/icons/clinical-trials_1.png
        media/icons/clinical-trials_2.png
        media/icons/outpatient_1.png
        media/icons/outpatient_2.png
        media/icons/protocol_1.png
        media/icons/protocol_2.png
        media/icons/protocol_3.png
        media/icons/protocol_4.png
        media/icons/search.png
        media/icons/plus.png
        media/icons/comboboxdropArrow.jpeg
        media/icons/comboboxdropArrowicon2.png
        media/icons/comboboxArrowImage.png
        media/icons/comboboxArrowImageUp.png
        media/icons/dropdownIcon.png
        media/icons/dropDownIcon.png
        media/icons/PrevMonth.png
        media/icons/NextMonth.png
        media/icons/SpinBoxDown.png
        media/icons/SpinBoxUp.png
        media/icons/pen.png
        media/icons/view.png
        media/icons/down-arrow.png
        media/icons/icon.ico
        media/icons/ico.ico

        media/protocolforms/img.png
        media/protocolforms/Mashonka/exp.txt
        media/protocolforms/Mashonka/index.html
        media/protocolforms/Mashonka/index.pdf

        media/protocolforms/Shitavitka/exp.txt
        media/protocolforms/Shitavitka/img/img2.jpg
        media/protocolforms/Shitavitka/img/img3.jpg
        media/protocolforms/Shitavitka/index.html

        media/protocolforms/Cелезенка/index.html
        media/protocolforms/Коленный_сустав/index.html
        media/protocolforms/Надпочечники/index.html
        media/protocolforms/Первый_триместр/index.html
        media/protocolforms/Фолликулометрия/index.html
        media/protocolforms/Печеньбланк/index.html
        media/protocolforms/Почкибланк/index.html
        media/protocolforms/Малый_таз_бланк/index.html
        media/protocolforms/Молочные_железы_бланк/index.html
        media/protocolforms/Надпочечники/index.html
        media/protocolforms/Плод_бланк/index.html
        media/protocolforms/Поджелудочная/index.html
        media/protocolforms/Простата/index.html
)

# =====================[ LINK Kutubxonalar ]=====================
target_link_libraries(front
    PRIVATE
        Qt6::Core
        Qt6::Gui
        Qt6::Widgets
        Qt6::PrintSupport
        Qt6::Pdf
        Qt6::PdfWidgets
        Qt6::WebEngineCore
        Qt6::WebEngineWidgets
        ${PQXX_LIBRARY}
        ${PostgreSQL_LIBRARIES}
        OpenSSL::SSL
        OpenSSL::Crypto
)

# =====================[ 🔧 Windows GUI bo‘lishi uchun ]=====================
if(WIN32)
    set_target_properties(front PROPERTIES WIN32_EXECUTABLE TRUE)
endif()

# =====================[ DLL copy qilish ]=====================
if(WIN32)
    set(VCPKG_BIN_DIR "C:/vcpkg/installed/x64-windows/bin")
    set(VCPKG_PQXX_BIN_DIR "C:/vcpkg/packages/libpqxx_x64-windows/bin")

    set(POSTGRES_DLLS
        libpq.dll
        libssl-3-x64.dll
        libcrypto-3-x64.dll
        libiconv-2.dll
        libintl-9.dll
        libwinpthread-1.dll
        zlib1.dll
    )

    foreach(dll ${POSTGRES_DLLS})
        if(EXISTS "${VCPKG_BIN_DIR}/${dll}")
            add_custom_command(TARGET front POST_BUILD
                COMMAND ${CMAKE_COMMAND} -E copy_if_different
                "${VCPKG_BIN_DIR}/${dll}"
                $<TARGET_FILE_DIR:front>
                COMMENT "Copying ${dll}"
            )
        endif()
    endforeach()

    if(EXISTS "${VCPKG_PQXX_BIN_DIR}")
        file(GLOB PQXX_DLLS "${VCPKG_PQXX_BIN_DIR}/*.dll")
        foreach(dll ${PQXX_DLLS})
            add_custom_command(TARGET front POST_BUILD
                COMMAND ${CMAKE_COMMAND} -E copy_if_different
                "${dll}"
                $<TARGET_FILE_DIR:front>
                COMMENT "Copying ${dll}"
            )
        endforeach()
    endif()

    # =====================[ windeployqt ]=====================
    get_target_property(_qmake_executable Qt6::qmake IMPORTED_LOCATION)
    get_filename_component(_qt_bin_dir "${_qmake_executable}" DIRECTORY)
    find_program(WINDEPLOYQT_EXECUTABLE windeployqt HINTS "${_qt_bin_dir}")

    if(WINDEPLOYQT_EXECUTABLE)
        add_custom_command(TARGET front POST_BUILD
            COMMAND "${WINDEPLOYQT_EXECUTABLE}"
                --verbose 1
                --no-translations
                --no-system-d3d-compiler
                --no-opengl-sw
                $<$<CONFIG:Release>:--release>
                $<$<CONFIG:Debug>:--debug>
                $<TARGET_FILE:front>
            COMMENT "Running windeployqt..."
        )
    endif()
endif()

# =====================[ INSTALL (deploy uchun) ]=====================
include(GNUInstallDirs)

install(TARGETS front
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

# =====================[ Shortcut yaratish (Desktop va Start) ]=====================
if(WIN32)
    install(CODE "
        message(STATUS \"Creating shortcuts...\")
        execute_process(
            COMMAND powershell -ExecutionPolicy Bypass -Command \"
                \$desktop = (New-Object -COM WScript.Shell).CreateShortcut('\$ENV:Public\\\\Desktop\\\\BayMax.lnk');
                \$desktop.TargetPath = '${CMAKE_INSTALL_PREFIX}/bin/front.exe';
                \$desktop.IconLocation = '${CMAKE_INSTALL_PREFIX}/bin/front.exe,0';
                \$desktop.WorkingDirectory = '${CMAKE_INSTALL_PREFIX}/bin';
                \$desktop.Description = 'BayMax Tibbiy Dastur';
                \$desktop.Save();

                \$sm = (New-Object -COM WScript.Shell).CreateShortcut('\$ENV:ProgramData\\\\Microsoft\\\\Windows\\\\Start Menu\\\\Programs\\\\BayMax.lnk');
                \$sm.TargetPath = '${CMAKE_INSTALL_PREFIX}/bin/front.exe';
                \$sm.IconLocation = '${CMAKE_INSTALL_PREFIX}/bin/front.exe,0';
                \$sm.WorkingDirectory = '${CMAKE_INSTALL_PREFIX}/bin';
                \$sm.Description = 'BayMax Tibbiy Dastur';
                \$sm.Save();
            \"
        )
    ")
endif()
