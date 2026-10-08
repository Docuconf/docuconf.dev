cmake_minimum_required(VERSION 3.16)
project(app LANGUAGES CXX)

include(FetchContent)
# Until the first release: the main branch (pin a commit SHA for reproducible builds).
FetchContent_Declare(docuconf
  GIT_REPOSITORY https://github.com/Docuconf/docuconf-cpp.git
  GIT_TAG main)
FetchContent_MakeAvailable(docuconf)

add_executable(app main.cpp)
target_link_libraries(app PRIVATE docuconf::docuconf)
