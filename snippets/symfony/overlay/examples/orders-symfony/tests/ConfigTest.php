<?php

use Docuconf\Symfony\Docuconf;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

// check() takes an explicit environment: the process environment is not read or changed.
final class ConfigTest extends KernelTestCase
{
    public function testAcceptsAValidEnvironment(): void
    {
        $result = self::getContainer()->get(Docuconf::class)->check(['DATABASE_URL' => 'postgres://orders@db/orders']);
        self::assertSame([], $result->violations);
    }

    public function testReportsEveryProblem(): void
    {
        $result = self::getContainer()->get(Docuconf::class)->check(['PORT' => '70000']);
        self::assertSame(
            ['PORT:out_of_range', 'DATABASE_URL:missing_required'],
            array_map(fn ($v) => "{$v->input}:{$v->code}", $result->violations),
        );
    }
}
