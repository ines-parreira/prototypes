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

import {fromJS} from 'immutable'

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

// unminified version to work with
// const chatScriptTemplate = `<!-- Gorgias Chat Widget Start -->
// <script id="gorgias-chat-widget-install">
// (function(win){
//     win.GORGIAS_CHAT_APP_ID = "__CHAT_APP_ID__";
//     win.GORGIAS_CHAT_BASE_URL = "__CHAT_URL__";
//     win.GORGIAS_API_BASE_URL = "__API_URL__";

//     var xhrChat = new XMLHttpRequest();
//     xhrChat.open("GET", "__ENDPOINT__", true);
//     xhrChat.onload = function(e) {
//         if (xhrChat.readyState === 4) {
//             if (xhrChat.status === 200) {
//                 var res = JSON.parse(xhrChat.responseText);
//                 if(!res.application || !res.bundleVersion) {
//                     throw new Error(
//                         "Missing fields in the response body - __ENDPOINT__"
//                     );
//                 }
//                 win.GORGIAS_CHAT_APP = res.application;
//                 win.GORGIAS_CHAT_BUNDLE_VERSION = res.bundleVersion;
//                 res && res.texts && (win.GORGIAS_CHAT_TEXTS = res.texts);
//                 res && res.sspTexts && (win.GORGIAS_CHAT_SELF_SERVICE_PORTAL_TEXTS = res.sspTexts);
//                 var targetTag = document.getElementById("__CONTAINER_ID__");
//                 if (!targetTag) {
//                     var c = document.createElement("div");
//                     c.id = "__CONTAINER_ID__";
//                     document.body.appendChild(c);
//                     var s = document.createElement("script");
//                     s.setAttribute("defer", true);
//                     s.src = "__BUNDLE_URL_REPLACE__".replace("__REPLACEABLE_TEXT__", res.bundleVersion);
//                     document.body.appendChild(s);
//                 }
//             } else {
//                 console.error('Failed request GET - __ENDPOINT__')
//             }
//         }
//     }
//     xhrChat.onerror = function(e) { console.error(e) }
//     xhrChat.send()
// })(window || {})
// </script>
// `
// previous template uglified on https://skalman.github.io/UglifyJS-online/
const minifiedChatScriptTemplate = `<script id="gorgias-chat-widget-install">!function(_){_.GORGIAS_CHAT_APP_ID="__CHAT_APP_ID__",_.GORGIAS_CHAT_BASE_URL="__CHAT_URL__",_.GORGIAS_API_BASE_URL="__API_URL__";var e=new XMLHttpRequest;e.open("GET","__ENDPOINT__",!0),e.onload=function(t){if(4===e.readyState)if(200===e.status){var n=JSON.parse(e.responseText);if(!n.application||!n.bundleVersion)throw new Error("Missing fields in the response body - __ENDPOINT__");if(_.GORGIAS_CHAT_APP=n.application,_.GORGIAS_CHAT_BUNDLE_VERSION=n.bundleVersion,n&&n.texts&&(_.GORGIAS_CHAT_TEXTS=n.texts),n&&n.sspTexts&&(_.GORGIAS_CHAT_SELF_SERVICE_PORTAL_TEXTS=n.sspTexts),!document.getElementById("__CONTAINER_ID__")){var o=document.createElement("div");o.id="__CONTAINER_ID__",document.body.appendChild(o);var r=document.createElement("script");r.setAttribute("defer",!0),r.src="__BUNDLE_URL_REPLACE__".replace("__REPLACEABLE_TEXT__",n.bundleVersion),document.body.appendChild(r)}}else console.error("Failed request GET - __ENDPOINT__")},e.onerror=function(_){console.error(_)},e.send()}(window||{});</script>`

export function renderChatCodeSnippet({
    chatAppId,
    gorgiasChatExtraState = fromJS({}),
}) {
    const replaceText = '{bundleVersion}'
    const urls = {
        development: {
            // TODO: make it available in the helpdesk env variables instead of hardcoding it here?
            bundleUrl: `${gorgiasChatExtraState.get(
                'bundleUrl'
            )}/static/js/main.js`,
            chatUrl: gorgiasChatExtraState
                .get('chatUrl', '')
                .replace('https://', ''),
            wsUrl: gorgiasChatExtraState.get('wsUrl'),
        },
        staging: {
            // TODO: make it available in the helpdesk env variables instead of hardcoding it here?
            bundleUrl: `https://client-builds.staging.gorgias.chat/${replaceText}/static/js/main.js`,
            chatUrl: 'us-east1-b39a.staging.gorgias.chat',
            wsUrl: 'us-east1-b39a.staging.gorgias.chat',
        },
        production: {
            bundleUrl: `https://client-builds.production.gorgias.chat/${replaceText}/static/js/main.js`,
            chatUrl: 'config.gorgias.chat',
            wsUrl: 'us-east1-898b.production.gorgias.chat',
        },
    }

    let environment = 'development'
    if (window.STAGING) {
        environment = 'staging'
    } else if (window.PRODUCTION) {
        environment = 'production'
    }

    const urlList = urls[environment]
    const endpoint = `https://${urlList.chatUrl}/applications/${chatAppId}`
    const containerId = 'gorgias-chat-container'
    const fullInstallScript = `${minifiedChatScriptTemplate}`

    const generatedChatSnippet = fullInstallScript
        .replace(/__CHAT_APP_ID__/g, chatAppId)
        .replace(/__CHAT_URL__/g, urlList.wsUrl)
        .replace(/__API_URL__/g, urlList.chatUrl)
        .replace(/__ENDPOINT__/g, endpoint)
        .replace(/__CONTAINER_ID__/g, containerId)
        .replace(/__BUNDLE_URL_REPLACE__/g, urlList.bundleUrl)
        .replace(/__REPLACEABLE_TEXT__/g, replaceText)

    return `${startComment}${generatedChatSnippet}${endComment}`
}
