      *> Configuration of a small job: generate it with
      *> docuconf-cobol generate app-config.cpy.
      *> @service app  @prefix CFG-  @program APPCFG
       01  APP-CONFIG.
      *> Port of the metrics endpoint
      *> @min 1  @max 65535  @default 8080
           05  CFG-PORT                PIC 9(5).
