import pytest

import docuconf
from app import Settings

NAMES = ("PORT", "LOG_LEVEL", "DATABASE_URL", "ALLOWED_ORIGINS", "REQUEST_TIMEOUT", "WORKER_COUNT")


@pytest.fixture
def load(monkeypatch):
    """Load Settings from exactly the given variables; monkeypatch restores the environment."""

    def load(**env):
        for name in NAMES:
            monkeypatch.delenv(name, raising=False)
        for name, value in env.items():
            monkeypatch.setenv(name, value)
        return docuconf.load(Settings, watch=False, termination_log=False)

    return load


def test_defaults(load):
    settings = load(DATABASE_URL="postgres://orders@db/orders")
    assert settings.port == 8080
    assert settings.worker_count == 4


def test_rejects_bad_values(load):
    with pytest.raises(docuconf.ConfigValidationError) as e:
        load(PORT="70000")
    codes = {(v.input, v.code) for v in e.value.violations}
    assert ("PORT", "out_of_range") in codes
    assert ("DATABASE_URL", "missing_required") in codes
