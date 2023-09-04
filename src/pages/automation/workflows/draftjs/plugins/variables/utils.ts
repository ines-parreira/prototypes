import {ContentBlock, ContentState, Modifier, SelectionState} from 'draft-js'

export const addEntityToVariable = (
    block: ContentBlock,
    contentState: ContentState,
    start: number,
    end: number
): ContentState => {
    const existingEntityKey = block.getEntityAt(start)
    if (existingEntityKey) {
        // avoid manipulation in case the flow variable already has an entity
        const entity = contentState.getEntity(existingEntityKey)
        if (entity && entity.getType() === 'flow_variable') {
            return contentState
        }
    }

    const value = block.getText().substring(start, end)

    let newContentState = contentState

    const contentStateWithEntity = newContentState.createEntity(
        'flow_variable',
        'IMMUTABLE',
        {value}
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

    const selection = SelectionState.createEmpty(block.getKey()).merge({
        anchorOffset: start,
        focusOffset: end,
    })
    // assign entity
    newContentState = Modifier.replaceText(
        newContentState,
        selection,
        value,
        undefined,
        entityKey
    )
    if (end === block.getLength()) {
        // bug: when inserting a flow var at the end of a block, the cursor is lost and editor looses focus
        // workaround: add artifical space at the end of the block
        newContentState = Modifier.insertText(
            newContentState,
            newContentState.getSelectionAfter(),
            ' '
        )
    }
    return newContentState
}
