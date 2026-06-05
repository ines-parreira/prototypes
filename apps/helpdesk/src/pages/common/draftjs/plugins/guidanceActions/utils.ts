import type { ContentBlock, ContentState } from 'draft-js'
import { EditorState, Modifier, SelectionState } from 'draft-js'
import findWithRegex from 'find-with-regex'

import type { GuidanceAction } from './types'

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

/**
 * Scan every block for guidance action placeholders (`$$$...$$$`) and attach
 * `guidance_action` entities so the decorator can render them as tags.
 *
 * The guidance actions plugin runs this on each editor change, but content set
 * externally (e.g. a cache-driven refetch) bypasses the plugin's onChange, so
 * callers that sync external content must run it explicitly — otherwise the
 * placeholders render as raw text until the editor is focused.
 */
export const attachGuidanceActionEntities = (
    editorState: EditorState,
): EditorState => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let newContentState = contentState

    blocks.forEach((block) => {
        if (block) {
            findWithRegex(guidanceActionRegex, block, (start, end) => {
                newContentState = addGuidanceActionEntity(
                    block,
                    newContentState,
                    start,
                    end,
                )
            })
        }
    })

    if (newContentState.equals(contentState)) {
        return editorState
    }

    const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'apply-entity',
    )
    // Preserve selection to prevent cursor jumping. Use forceSelection only
    // when the editor was focused — it always sets hasFocus to true, which
    // would otherwise steal focus when syncing content into an unfocused editor.
    const hadFocus = editorState.getSelection().getHasFocus()
    const selection = newEditorState
        .getSelection()
        .merge({ hasFocus: hadFocus })
    return hadFocus
        ? EditorState.forceSelection(newEditorState, selection)
        : EditorState.acceptSelection(newEditorState, selection)
}

export const replaceActionPlaceholdersWithLabels = (
    content: string,
    actions: GuidanceAction[],
): string => {
    return content.replace(guidanceActionRegex, (_, actionId) => {
        const action = actions.find((a) => a.value === actionId)
        if (!action) return `Use action: ${actionId}`

        return `Use action: ${action.name}`
    })
}
