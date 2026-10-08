import dev.docuconf.examples.orders.OrdersConfig
import dev.docuconf.hoplite.Docuconf
import dev.docuconf.kotlin.core.ConfigViolationException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class OrdersConfigTest {
    // Load from an explicit map: System.getenv() is never read.
    private fun load(vararg env: Pair<String, String>) = Docuconf.load<OrdersConfig> {
        this.env = mapOf(*env)
    }

    @Test
    fun defaults() {
        val config = load("DATABASE_URL" to "postgres://orders@db/orders")
        assertEquals(8080, config.port)
        assertEquals(4, config.workerCount)
    }

    @Test
    fun rejectsBadValues() {
        val e = assertFailsWith<ConfigViolationException> { load("PORT" to "70000") }
        val codes = e.violations.map { it.input to it.code }
        assertTrue("PORT" to "out_of_range" in codes, "$codes")
        assertTrue("DATABASE_URL" to "missing_required" in codes, "$codes")
    }
}
