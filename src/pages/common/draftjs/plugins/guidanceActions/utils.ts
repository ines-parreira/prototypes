import { ContentBlock, ContentState, Modifier, SelectionState } from 'draft-js'

import { GuidanceAction } from './types'

export const guidanceActionRegex = /\$\$\$([^\$]*)\$\$\$/g

export const encodeAction = (action: GuidanceAction) => {
    return `$$$${action.value}$$$`
}

export const addGuidanceActionEntity = (
    block: ContentBlock,
    contentState: ContentState,
    start: number,
    end: number,
): ContentState => {
    const existingEntityKey = block.getEntityAt(start)
    if (existingEntityKey) {
        // avoid manipulation in case the action already has an entity
        const entity = contentState.getEntity(existingEntityKey)
        if (entity && entity.getType() === 'guidance_action') {
            return contentState
        }
    }

    const value = block.getText().substring(start, end)

    const entityData: { value: string } = { value }

    let newContentState = contentState

    const contentStateWithEntity = newContentState.createEntity(
        'guidance_action',
        'IMMUTABLE',
        entityData,
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
        entityKey,
    )
    return newContentState
}
