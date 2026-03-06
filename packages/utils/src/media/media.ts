import crypto from 'crypto'
import htmlparser from 'htmlparser2'
import URLSafeBase64 from 'urlsafe-base64'

import {
    getEnvironment,
    GorgiasUIEnv,
    isProduction,
    isStaging,
} from '../environment'

const privateBuckets: Record<GorgiasUIEnv, string> = {
    [GorgiasUIEnv.Development]: '//uploads.gorgi.us',
    [GorgiasUIEnv.Production]: '//uploads.gorgias.io',
    [GorgiasUIEnv.Staging]: '//uploads.gorgias.xyz',
}

export function isPrivateAsset(url: string) {
    const bucketUrl = privateBuckets[getEnvironment()]
    return url.includes(bucketUrl)
}

export const replaceAttachmentURL = (
    url: string,
    format?: string,
    isInternalSource?: boolean,
) => {
    const ATTACHMENT_PATH = 'api/attachment/download'
    const accountDomain = window.GORGIAS_STATE.currentAccount.domain

    let formatParam = ''
    if (format) {
        if (url.includes('?')) {
            formatParam = `&format=${format}`
        } else {
            formatParam = `?format=${format}`
        }
    }

    if (isProduction()) {
        const hostnameTLD = location.hostname.split('.').pop()
        const tld = hostnameTLD === 'io' ? 'io' : 'com'

        return isInternalSource
            ? url.replace(
                  `//${accountDomain}.gorgias.${tld}/${ATTACHMENT_PATH}`,
                  '//uploads.gorgias.io',
              )
            : url.replace(
                  '//uploads.gorgias.io',
                  `//${accountDomain}.gorgias.${tld}/${ATTACHMENT_PATH}`,
              ) + formatParam
    }

    if (isStaging()) {
        return isInternalSource
            ? url.replace(
                  `//${accountDomain}.gorgias.xyz/${ATTACHMENT_PATH}`,
                  '//uploads.gorgias.xyz',
              )
            : url.replace(
                  '//uploads.gorgias.xyz',
                  `//${accountDomain}.gorgias.xyz/${ATTACHMENT_PATH}`,
              ) + formatParam
    }

    return isInternalSource
        ? url.replace(
              `http://${accountDomain}.gorgias.docker/${ATTACHMENT_PATH}`,
              'https://uploads.gorgi.us/development',
          )
        : url.replace(
              'https://uploads.gorgi.us/development',
              `http://${accountDomain}.gorgias.docker/${ATTACHMENT_PATH}`,
          ) + formatParam
}

const _proxyImageSignedURL = (url: string): string => {
    if (!window.IMAGE_PROXY_SIGN_KEY) {
        throw new Error('window.IMAGE_PROXY_SIGN_KEY is not defined')
    }
    return (
        's' +
        URLSafeBase64.encode(
            crypto
                .createHmac('sha256', window.IMAGE_PROXY_SIGN_KEY)
                .update(url)
                .digest(),
        )
    )
}

export const proxifyURL = (urlStr: string, format = 'cw-1'): string => {
    const url = new URL(urlStr)
    const escapedURL = `${url.origin}${url.pathname}${url.search}`
    return `${window.IMAGE_PROXY_URL}${format},${_proxyImageSignedURL(
        escapedURL,
    )}/${escapedURL}`
}

const proxifyImage = (
    attributes: Record<string, unknown>,
    imageFormat: string,
) => {
    let v: string
    try {
        v = proxifyURL(attributes.src as string, imageFormat)
        return v
    } catch (error) {
        console.error(error)
    }
}

export const parseMedia = (html: string, imageFormat = '1000x'): string => {
    const handledTags = ['a', 'audio', 'img']
    if (!handledTags.some((tag) => html.includes(`<${tag} `))) {
        return html
    }

    if (!window.IMAGE_PROXY_URL) {
        throw new Error('window.IMAGE_PROXY_URL is not defined')
    }

    const selfClosing = [
        'img',
        'br',
        'hr',
        'area',
        'base',
        'basefont',
        'input',
        'link',
        'meta',
    ]

    let result = ''
    const parser = new htmlparser.Parser({
        onopentag: (name: string, attributes: Record<string, unknown>) => {
            result += `<${name}`
            const attributesKeys = Object.keys(attributes)
            if (attributesKeys.length) {
                result += ' '
            }

            const attributePairs: string[] = []
            attributesKeys.forEach((k) => {
                let v = attributes[k] as string
                if (
                    name === 'img' &&
                    k === 'src' &&
                    typeof attributes.src === 'string' &&
                    !attributes.src.startsWith('data:image') &&
                    attributes.src.indexOf(window.IMAGE_PROXY_URL) === -1
                ) {
                    if (isPrivateAsset(attributes.src as string)) {
                        v = replaceAttachmentURL(
                            attributes.src as string,
                            imageFormat,
                        )
                    } else {
                        v = proxifyImage(attributes, imageFormat) as string
                    }
                }
                if (name === 'audio' && k === 'src') {
                    v = replaceAttachmentURL(attributes.src as string)
                }
                if (name === 'a' && k === 'href') {
                    v = replaceAttachmentURL(attributes.href as string)
                }
                attributePairs.push(`${k}="${v}"`)
            })
            result += attributePairs.join(' ')

            if (selfClosing.indexOf(name) !== -1) {
                result += '/>'
            } else {
                result += '>'
            }
        },
        ontext: (text: string) => {
            result += text
        },
        onclosetag: ((name: string) => {
            if (selfClosing.indexOf(name) === -1) {
                result += `</${name}>`
            }
        }) as any,
    })
    parser.write(html)
    parser.end()
    return result
}
