package app;

import dev.docuconf.Docuconf;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Compiles once the SDK is installed: the install check for the Get started page.
 *
 * @param port HTTP listen port
 */
@Docuconf(service = "app")
@ConfigurationProperties("app")
public record AppProperties(@Min(1) @Max(65535) @DefaultValue("8080") int port) {}
