cmake_minimum_required(VERSION 3.16)
project(orders_test LANGUAGES CXX)

# The SDK from this repository, and GoogleTest.
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../.. docuconf-sdk)
find_package(GTest REQUIRED)

add_executable(config_test config_test.cpp)
target_link_libraries(config_test PRIVATE docuconf::docuconf GTest::gtest_main)
