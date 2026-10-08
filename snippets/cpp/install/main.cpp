// Builds and runs once the SDK is installed: the install check for the Get started page.
#include <iostream>

#include <docuconf/docuconf.hpp>

int main(int argc, char** argv) {
    CLI::App app{"app"};
    docuconf::Declaration config{app, "app"};

    int port = 0;
    config.add_var("PORT", port, "HTTP listen port").range(1, 65535).default_val(8080);

    DOCUCONF_PARSE(config, argc, argv);
    std::cout << "ok: port " << port << "\n";
}
