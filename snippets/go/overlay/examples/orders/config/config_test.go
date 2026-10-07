package config_test

import (
	"errors"
	"testing"

	"github.com/docuconf/docuconf-go"
	"github.com/docuconf/docuconf-go/examples/orders/config"
)

// Load from an explicit environment: the process environment is not read or changed.
func load(env map[string]string) (config.Config, error) {
	return docuconf.ParseWithOptions[config.Config](docuconf.Options{
		Environment:    env,
		TerminationLog: "-", // don't write /dev/termination-log from tests
	})
}

func TestDefaults(t *testing.T) {
	cfg, err := load(map[string]string{"DATABASE_URL": "postgres://orders@db/orders"})
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Port != 8080 || cfg.WorkerCount != 4 {
		t.Errorf("got port %d, %d workers", cfg.Port, cfg.WorkerCount)
	}
}

func TestRejectsBadValues(t *testing.T) {
	_, err := load(map[string]string{"PORT": "70000"})
	var verr *docuconf.ValidationError
	if !errors.As(err, &verr) {
		t.Fatalf("want a ValidationError, got %v", err)
	}
	if !verr.Has(docuconf.CodeOutOfRange) || !verr.Has(docuconf.CodeMissingRequired) {
		t.Errorf("got %v", verr.Violations)
	}
}
