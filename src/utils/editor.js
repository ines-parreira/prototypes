// @flow
import linkifyhtml from 'linkifyjs/html'
import {convertToHTML as _convertToHTML, convertFromHTML as _convertFromHTML} from 'draft-convert'
import linkifyIt from 'linkify-it'
import {ContentState} from 'draft-js'

import {DEFAULT_IMAGE_WIDTH} from '../config/editor'
import {availableVariables} from '../config/rules'

// note that 2 letters tlds are automatically interpreted
const tlds = 'com edu gov ru org net de jp uk br it pl in fr au ir nl info cn es cz kr ca ua eu co gr za ro biz ch se io'.split(' ')
export const linkify = linkifyIt().tlds(tlds)

/**
 * Temporarily adds an uid at the end of each {{variable}} (eg. {{variable}}123),
 * runs the callback on the new string, then removes the uid.
 * Required for supporting links ending with variables (eg. www.google.com/{{ticket.id}}).
 *
 * @param {String} field the field path. E.g: ticket.customer.id
 * @param {Function} function to run on the string
 * @returns {String} parsed string with removed uids
 */
const fixLinkVars = (html: string, callback: (T: string) => string): string => {
    // use a uid, so we don't accidentally replace something else.
    const uid = String(Date.now())
    // add uid at the end of the variables,
    // this makes urls with {{}} valid.
    const replacedHtml = html.replace(/{{.*?}}/g, (match) => `${match}${uid}`)
    // synchronous extra parsing (eg. linkify)
    const parsedHtml = callback(replacedHtml) || replacedHtml
    // remove the added uid
    const restoreRegex = new RegExp(`{{.*?}}${uid}`, 'g')
    return parsedHtml.replace(restoreRegex, (match) => match.replace(uid, ''))
}

/**
 * Single convertToHTML config for the entire app (same options everywhere if needed)
 * @param contentState
 */
export function convertToHTML(contentState: ContentState): string {
    return fixLinkVars(_convertToHTML({
        blockToHTML: {
            unstyled: {
                start: '<div>',
                end: '</div>',
                empty: '<br>' // when we have an empty block (corresponds with a new line, add a line break)
            },
            atomic: {
                start: '<figure style="display: inline-block; margin: 0">',
                end: '</figure>'
            }
        },
        entityToHTML: (entity, originalText) => {
            if (entity.type === 'link') {
                // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                return {
                    start: `<a href="${entity.data.url}" target="_blank">`,
                    end: '</a>',
                }
            }

            if (entity.type === 'img') {
                const width = entity.data.width || DEFAULT_IMAGE_WIDTH

                // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                return `<img src="${entity.data.src}" width="${width}px" style="max-width: 100%" />`
            }

            if (entity.type === 'mention') {
                return {
                    start: '<span class="gorgias-mention">',
                    end: '</span>'
                }
            }

            return originalText
        }
    })(contentState), (str) => {
        // linkify transforms linkified urls into actual HTML links
        return linkifyhtml(str, {
            validate: {
                url(value) {
                    return linkify.test(value)
                }
            }
        })
    })
}

/**
 * Unescape template variables from a string
 *
 * Input: `send email to %7B%7Bticket.customer.email%7D%7D`
 * Output: `send email to {{ticket.customer.email}}`
 */
export function unescapeTemplateVars(string: string): string {
    // `%7B%7B` : {{
    // `(?:${availableVariables.join('|')})` : variable needs to start by one of the available variable names in rules
    // `[\w\.\[\]` : followed by alphanumeric, dot or square bracket characters
    // `%7D%7D` : }}
    const reg = new RegExp(`%7B%7B((?:${availableVariables.join('|')})[\\w\\.\\[\\]]*?)%7D%7D`, 'g')
    return string.replace(reg, (_, match) => {
        return `{{${match}}}`
    })
}

/**
 * Single convertFromHTML config for the entire app (same options everywhere if needed)
 * @param html
 */
export function convertFromHTML(html: string): ContentState {
    let converted = _convertFromHTML({
        htmlToBlock: (nodeName) => {
            if (nodeName === 'figure' || nodeName === 'img') {
                return 'atomic'
            }
        },
        htmlToEntity: (nodeName, node, createEntity) => {
            if (nodeName === 'a') {
                return createEntity(
                    'link',
                    'MUTABLE',
                    {url: unescapeTemplateVars(node.href)}
                )
            }

            if (nodeName === 'img') {
                return createEntity(
                    'img',
                    'MUTABLE',
                    {
                        src: node.src,
                        width: node.width || DEFAULT_IMAGE_WIDTH,
                    }
                )
            }
        },
    })(html)

    // line breaks for windows/linux/mac
    const lineBreaks = ['\r\n', '\n', '\r']

    const blocks = converted.getBlocksAsArray().map((block) => {
        const type = block.getType()
        let newBlock = block
        if (type === 'atomic') {
            // remove the default 'a' character in atomic blocks so that text from getPlainText() of this contentState that not
            // carry a 'a' where images are supposed to be displayed
            // see https://github.com/HubSpot/draft-convert/issues/30
            newBlock = newBlock.set('text', ' ')
        } else if (type === 'unstyled') {
            // remove the last newline in a block,
            // otherwise it appears as an extra newline in the editor,
            // because draft-uses uses white-space: pre-wrap.
            let text = newBlock.get('text')
            lineBreaks.some((char) => {
                const lastPos = text.length - char.length
                if (text.substring(lastPos) === char) {
                    newBlock = newBlock.set('text', text.substring(0, lastPos))
                    return true
                }
            })
        }

        return newBlock
    })

    converted = ContentState.createFromBlockArray(blocks)

    return converted
}
