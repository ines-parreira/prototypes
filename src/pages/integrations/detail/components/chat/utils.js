import _replace from 'lodash/replace'


// removes empty properties from an object
const _cleanOptions = (obj, newObj = {}) => {
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object') {
            const nested = _cleanOptions(obj[key])
            // no empty objects
            if (Object.keys(nested).length) {
                newObj[key] = nested
            }
        } else if (obj[key]) {
            newObj[key] = obj[key]
        }
    })

    return newObj
}

export const renderCodeSnippet = (integration) => {
    const options = {
        icon: integration.getIn(['decoration', 'icon']),
        headerColor: integration.getIn(['decoration', 'header_color']),
        chatIconColor: integration.getIn(['decoration', 'chat_icon_color']),
        conversationColor: integration.getIn(['decoration', 'conversation_color']),
        smooch: {
            appToken: integration.getIn(['meta', 'app_token']),
            properties: {
                current_page: 'window.location.href'
            },
            customText: {
                headerText: integration.getIn(['decoration', 'header_text']),
                introductionText: integration.getIn(['decoration', 'introduction_text']),
                inputPlaceholder: integration.getIn(['decoration', 'input_placeholder']),
                sendButtonText: integration.getIn(['decoration', 'send_button_text'])
            }
        }
    }

    const cleanedOptions = _replace(
        JSON.stringify(_cleanOptions(options), null, '  '),
        '"window.location.href"',
        'window.location.href'
    )

    let snippet = '<div id="gorgias-chat">\n'

    snippet += `<script src="${window.GORGIAS_ASSETS_URL || window.location.origin}/static/public/js/gorgias-chat.js"></script>\n`
    snippet += '<script>\n'
    snippet += 'document.addEventListener("DOMContentLoaded", function() {\n'
    snippet += `GorgiasChat.init(${cleanedOptions})\n`
    snippet += '})\n'
    snippet += '</script>\n'
    snippet += '</div>'

    return snippet
}
