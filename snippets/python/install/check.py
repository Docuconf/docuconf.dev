# Runs once the SDK is installed: the install check for the Get started page.
from pydantic import Field

import docuconf


class Settings(docuconf.DocuconfSettings):
    port: int = Field(8080, ge=1, le=65535, description="HTTP listen port")


print("ok" if "PORT" in docuconf.to_contract(Settings, name="app") else "no PORT in the contract")
