using Docuconf;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Orders.Api;
using Xunit;

public class OrdersOptionsTests
{
    // Build the options from an in-memory configuration: no environment variables are read or set.
    static OrdersOptions Load(Dictionary<string, string?> values)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();
        var services = new ServiceCollection().AddSingleton<IConfiguration>(configuration);
        services.AddDocuconf<OrdersOptions>(s => s.TerminationLogPath = Path.GetTempFileName());
        return services.BuildServiceProvider().GetRequiredService<IOptions<OrdersOptions>>().Value;
    }

    [Fact]
    public void Defaults()
    {
        var orders = Load(new() { ["Orders:DatabaseUrl"] = "postgres://orders@db/orders" });
        Assert.Equal(8080, orders.Port);
        Assert.Equal(TimeSpan.FromSeconds(30), orders.RequestTimeout);
    }

    [Fact]
    public void RejectsBadValues()
    {
        var e = Assert.Throws<OptionsValidationException>(() => Load(new() { ["Orders:Port"] = "70000" }));
        Assert.Contains(e.Failures, f => f.StartsWith("[out_of_range] ORDERS__PORT"));
        Assert.Contains(e.Failures, f => f.StartsWith("[missing_required] ORDERS__DATABASEURL"));
    }
}
