// Builds once the SDK is installed: the install check for the Get started page.
package main

import "github.com/docuconf/docuconf-go"

type Config struct {
	// HTTP listen port.
	Port int `env:"PORT" envDefault:"8080" min:"1" max:"65535"`
}

func main() {
	if _, err := docuconf.Parse[Config](); err != nil {
		panic(err)
	}
}
