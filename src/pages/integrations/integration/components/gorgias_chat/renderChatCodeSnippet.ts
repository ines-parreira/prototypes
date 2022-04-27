/**

Simple HTML template

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!-- PAST SCRIPT HERE -->
  </body>
</html>

 */

import {fromJS, Map} from 'immutable'

import {getEnvironment} from '../../../../../utils/environment'

const startComment = '<!--Gorgias Chat Widget Start-->'
const endComment = '<!--Gorgias Chat Widget End-->'

// unminified version to work with
{
    /*
<script id="gorgias-chat-shopify-install">
(function(win){
    win.SHOPIFY_PERMANENT_DOMAIN='{{shop.permanent_domain}}';
    win.SHOPIFY_CUSTOMER_ID='{{customer.id}}';
    win.SHOPIFY_CUSTOMER_EMAIL='{{customer.email}}';
})(window||{})
</script>

Uglified with https://skalman.github.io/UglifyJS-online/
*/
}

/* TODO: add this to the documentation
const minifiedShopifyScript = `<script id="gorgias-chat-shopify-install">!function(_){_.SHOPIFY_PERMANENT_DOMAIN="{{shop.permanent_domain}}",_.SHOPIFY_CUSTOMER_ID="{{customer.id}}",_.SHOPIFY_CUSTOMER_EMAIL="{{customer.email}}"}(window||{});</script>`
 */

const chatInstallationScript =
    '<script id="gorgias-chat-widget-install-v2" src="https://__CHAT_API_URL__/gorgias-chat-bundle-loader.js?applicationId=__CHAT_APP_ID__"></script>'

export function renderChatCodeSnippet({
    chatAppId,
    gorgiasChatExtraState = fromJS({}),
}: {
    chatAppId: string
    gorgiasChatExtraState: Map<any, any>
}) {
    const chatApiUrls = {
        development: (
            gorgiasChatExtraState.get('chatUrl', '') as string
        ).replace('https://', ''),
        staging: 'config.gorgias-staging.chat',
        production: 'config.gorgias.chat',
    }

    const environment = getEnvironment()

    const generatedChatSnippet = chatInstallationScript
        .replace(/__CHAT_APP_ID__/g, chatAppId)
        .replace(/__CHAT_API_URL__/g, chatApiUrls[environment])

    return `${startComment}${generatedChatSnippet}${endComment}`
}
