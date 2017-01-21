import {getValuePropFromSourceType} from '../../../state/ticket/utils'

export function displayUserNameFromSource(user, sourceType) {
    const valueProp = getValuePropFromSourceType(sourceType)
    const value = user[valueProp]

    let label = user.name || value

    // if is email channel and has a name, show the address next to the name
    if (sourceType === 'email') {
        if (user.name) {
            label = `${user.name} (${value})`
        } else {
            label = value
        }
    }

    return label
}

export function isTicketDifferent(currentTicket, nextTicket) {
    const cTicket = currentTicket
        .deleteIn(['newMessage', 'body_text'])
        .deleteIn(['newMessage', 'body_html'])
        .deleteIn(['state', 'contentState'])
        .deleteIn(['state', 'selectionState'])

    const nTicket = nextTicket
        .deleteIn(['newMessage', 'body_text'])
        .deleteIn(['newMessage', 'body_html'])
        .deleteIn(['state', 'contentState'])
        .deleteIn(['state', 'selectionState'])

    return !cTicket.equals(nTicket)
}

/**
 * Map file format like 'image/png' to the semantic ui
 * @param {string} format E.G : 'image/png'
 * @returns {string}
 */
export function mapFileFormatToSemanticIcon(format) {
    const icon = 'file'

    switch (true) {
        case /(png|jpe?g)/.test(format):
            return `${icon} image outline`
        case /pdf/.test(format):
            return `${icon} pdf outline`
        default:
            return `${icon} text outline`
    }
}
