# helpdesk_dev.py
# v0.0.0

import os
import re
import typing

from mitmproxy import ctx, http

PROXY_PORT = int(os.environ.get("PROXY_PORT", 8002))
DEV_PORT = int(os.environ.get("DEV_PORT", 8080))


class RedirectSpec(typing.NamedTuple):
    subject: str
    replacement: str


class LocalHelpdeskProxy:
    local_url = f"https://acme.gorgias.docker:{DEV_PORT}/"
    assets_domain = "myassets.gorgias.com"
    assetsRedirection: RedirectSpec(r'^.*/assets/(.*)', r'assets/\1')
    gorgias_domains = ["gorgias.xyz", "gorgias.com", "gorgias.io"]
    redirections: typing.List[RedirectSpec] = [
        RedirectSpec(
            "^.*/helpdesk\\.vendors\\.[a-z0-9]+\\.js$",
            "helpdesk.vendors.js",
        ),
        RedirectSpec(
            "^.*/helpdesk\\.vendors\\.[a-z0-9]+\\.js.map$",
            "helpdesk.vendors.js.map",
        ),
        RedirectSpec("^.*/helpdesk\\.app\\.[a-z0-9]+\\.js", "helpdesk.app.js"),
        RedirectSpec("^.*/helpdesk\\.app\\.[a-z0-9]+\\.js.map", "helpdesk.app.js.map"),
        RedirectSpec("^.*/helpdesk\\.app\\.[a-z0-9]+\\.css", "helpdesk.app.css"),
        RedirectSpec("^.*/helpdesk\\.app\\.[a-z0-9]+\\.css.map", "helpdesk.app.css.map"),
        RedirectSpec("^.*/helpdesk\\.shared-worker\\.[a-z0-9]+\\.js", "helpdesk.shared-worker.js"),
        RedirectSpec("^.*/helpdesk\\.shared-worker\\.[a-z0-9]+\\.js.map", "helpdesk.shared-worker.js.map"),
        RedirectSpec("^.*/helpdesk\\.service-worker\\.[a-z0-9]+\\.js", "helpdesk.service-worker.js"),
        RedirectSpec("^.*/helpdesk\\.service-worker\\.[a-z0-9]+\\.js.map", "helpdesk.service-worker.js.map"),
        RedirectSpec("^.*/sockjs-node", "sockjs-node"),
        RedirectSpec("^.*/icons\\.[a-z0-9]+\\.svg", "icons.svg"),
    ]

    def load(self, flow) -> None:
        ctx.options.ssl_insecure = True
        ctx.options.listen_port = PROXY_PORT

    def request(self, flow: http.HTTPFlow) -> None:
        if flow.response or flow.error:
            return

        if any(domain in flow.request.pretty_host for domain in self.gorgias_domains):
            for spec in self.redirections:
                url = flow.request.pretty_url
                local_replacement = f"{self.local_url}{spec.replacement}"
                new_url = re.sub(spec.subject, local_replacement, url)

                if url != new_url:
                    flow.request.url = new_url

        if (self.assets_domain in flow.request.pretty_host):
            url = flow.request.pretty_url
            local_replacement = f"{self.local_url}{self.assetsRedirection.replacement}"
            new_url = re.sub(self.assetsRedirection.subject, local_replacement, url)
            if url != new_url:
                    flow.request.url = new_url




addons = [LocalHelpdeskProxy()]
