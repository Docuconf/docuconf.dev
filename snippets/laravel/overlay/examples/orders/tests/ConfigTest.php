<?php

use Docuconf\Declaration;
use Illuminate\Foundation\Testing\TestCase;

// With APP_ENV=testing the app skips its boot check; check() takes an explicit environment instead.
final class ConfigTest extends TestCase
{
    public function test_accepts_a_valid_environment(): void
    {
        $result = $this->app->make(Declaration::class)->check(['DATABASE_URL' => 'postgres://orders@db/orders']);
        $this->assertSame([], $result->violations);
    }

    public function test_reports_every_problem(): void
    {
        $result = $this->app->make(Declaration::class)->check(['PORT' => '70000']);
        $this->assertSame(
            ['PORT:out_of_range', 'DATABASE_URL:missing_required'],
            array_map(fn ($v) => "{$v->input}:{$v->code}", $result->violations),
        );
    }
}
