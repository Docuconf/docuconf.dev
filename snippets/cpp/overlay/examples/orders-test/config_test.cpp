#include <gtest/gtest.h>

#include <string>
#include <vector>

#include <docuconf/docuconf.hpp>

struct Config {
    int port = 0;
    std::string database_url;
};

// The declaration, in a function that main and the tests both call.
void declare(docuconf::Declaration& d, Config& c) {
    d.add_var("PORT", c.port, "HTTP listen port").range(1, 65535).default_val(8080);
    d.add_var("DATABASE_URL", c.database_url, "Primary Postgres connection string").secret().required().schemes({"postgres"});
}

TEST(Config, UsesDefaults) {
    CLI::App app;
    docuconf::Declaration d{app, "orders"};
    Config c;
    declare(d, c);
    // load(env) reads only this map, never the process environment.
    d.load({{"DATABASE_URL", "postgres://orders@db/orders"}});
    EXPECT_EQ(c.port, 8080);
}

TEST(Config, ReportsEveryProblem) {
    CLI::App app;
    docuconf::Declaration d{app, "orders"};
    Config c;
    declare(d, c);
    try {
        d.load({{"PORT", "70000"}});
        FAIL() << "expected a ValidationError";
    } catch (const docuconf::ValidationError& e) {
        EXPECT_EQ(e.codes_for("PORT"), std::vector<docuconf::Code>{docuconf::Code::OutOfRange});
        EXPECT_TRUE(e.has(docuconf::Code::MissingRequired));
    }
}
