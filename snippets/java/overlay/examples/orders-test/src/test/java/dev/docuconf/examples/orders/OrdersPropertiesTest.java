package dev.docuconf.examples.orders;

import static org.assertj.core.api.Assertions.assertThat;

import dev.docuconf.spring.DocuconfAutoConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OrdersPropertiesTest {

    @EnableConfigurationProperties(OrdersProperties.class)
    static class Config {}

    // A context with just the configuration: properties come from withPropertyValues, not the environment.
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(DocuconfAutoConfiguration.class,
                    ConfigurationPropertiesAutoConfiguration.class, ValidationAutoConfiguration.class))
            .withUserConfiguration(Config.class);

    @Test
    void defaults() {
        runner.withPropertyValues("orders.database-url=postgres://orders@db/orders").run(context -> {
            OrdersProperties orders = context.getBean(OrdersProperties.class);
            assertThat(orders.port()).isEqualTo(8080);
            assertThat(orders.workerCount()).isEqualTo(4);
        });
    }

    @Test
    void rejectsBadValues() {
        runner.withPropertyValues("orders.port=70000").run(context -> assertThat(context)
                .getFailure()
                .hasMessageContaining("[out_of_range] ORDERS_PORT")
                .hasMessageContaining("[missing_required] ORDERS_DATABASEURL"));
    }
}
