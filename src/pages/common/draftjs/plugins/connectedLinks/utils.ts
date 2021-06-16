import {EditorState, EditorChangeType} from 'draft-js'

const hasProtocol = (url: string): boolean => {
    return url.indexOf('//') === 0 || url.includes('://')
}

const matchProtocols = ['http:', 'https:']

export const parseUrl = (url = '', target = ''): string => {
    let formattedUrl = url.trim()
    // only parse in the browser
    if (typeof window.document === 'undefined') {
        return formattedUrl
    }

    // add http, if url doesn't include protocol.
    // required so we can change protocol with a.protocol = ''.
    // using // relative-protocol does not work.
    if (!hasProtocol(formattedUrl)) {
        formattedUrl = `http://${formattedUrl}`
    }

    const a = document.createElement('a')
    a.href = formattedUrl

    // mimic target url protocol and www subdomain,
    // so not-exact urls match (eg. google.com, www.google.com, http://google.com).
    if (target) {
        const targetUrl = document.createElement('a')
        targetUrl.href = target

        const subdomain = 'www'
        // target has www, but not url
        const targetParts = targetUrl.hostname.split('.')
        const urlParts = a.hostname.split('.')
        if (targetParts[0] === subdomain && urlParts[0] !== subdomain) {
            a.hostname = `www.${a.hostname}`
        }

        // only supported protocols
        if (matchProtocols.includes(targetUrl.protocol)) {
            a.protocol = targetUrl.protocol
        }
    }

    // chrome encodes special chars like {&}
    return decodeURI(a.href)
}

// connected links have the same text and href
export const setConnectedLinks = (editorState: EditorState): EditorState => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let newContentState = contentState

    blocks.forEach((block) => {
        const plainText = block!.getText()
        block!.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return (
                    entityKey !== null &&
                    newContentState.getEntity(entityKey).getType() === 'link'
                )
            },
            (start, end) => {
                const value = plainText.substring(start, end)
                const entityKey = block!.getEntityAt(start)
                const entity = newContentState.getEntity(entityKey)
                const {url, connected} = entity.getData()
                const newEntityData: {url?: string; connected?: boolean} = {}

                if (connected) {
                    // link is already connected, update its url.
                    newEntityData.url = parseUrl(value)
                } else if (parseUrl(url) === parseUrl(value, url)) {
                    // link is not connected, but href and text are the same.
                    // set it as connected.
                    newEntityData.connected = true
                }

                newContentState = newContentState.mergeEntityData(
                    entityKey,
                    newEntityData
                )
            }
        )
    })

    if (!newContentState.equals(contentState)) {
        return EditorState.push(
            editorState,
            newContentState,
            'set-connected-links' as EditorChangeType
        )
    }

    return editorState
}
