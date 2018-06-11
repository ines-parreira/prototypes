import {EditorState} from 'draft-js'

// connected links have the same text and href
export const setConnectedLinks = (editorState) => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let newContentState = contentState

    blocks.forEach((block) => {
        const plainText = block.getText()
        block.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return (
                    entityKey !== null &&
                    newContentState.getEntity(entityKey).get('type') === 'link'
                )
            },
            (start, end) => {
                const value = plainText.substring(start, end)
                const entityKey = block.getEntityAt(start)
                const entity = newContentState.getEntity(entityKey)
                const {url, connected} = entity.get('data')
                let newEntityData = {}
                if (connected) {
                    // link is already connected, update its url.
                    newEntityData.url = value
                } else if (value === url) {
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
            'set-connected-links',
        )
    }

    return editorState
}
