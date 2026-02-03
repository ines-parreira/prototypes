import type { RawDraftContentBlock } from 'draft-js'
import { ContentState, convertToRaw, EditorState, Modifier } from 'draft-js'
import _pickBy from 'lodash/pickBy'

import { getEntitySelectionState } from '../../../../../utils/editor'
import { cachedSelection, predictionKey } from './state'

const PREDICTION_TYPE = 'prediction'

export const createPrediction = (
    text: string,
    editorState: EditorState,
): string => {
    const currentContent = editorState.getCurrentContent()
    const entityContentState = currentContent.createEntity(
        PREDICTION_TYPE,
        'IMMUTABLE',
        { text },
    )
    return entityContentState.getLastCreatedEntityKey()
}

export const insertPrediction = (
    entityKey: string,
    editorState: EditorState,
) => {
    const currentContent = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const textWithEntity = Modifier.insertText(
        currentContent,
        selection,
        ' ',
        undefined,
        entityKey,
    )

    return EditorState.push(editorState, textWithEntity, 'insert-characters')
}

export const removePrediction = (
    entityKey: string,
    editorState: EditorState,
) => {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const entitySelection = getEntitySelectionState(contentState, entityKey)
    // when sending the message with ctrl + enter, entitySelection is undefined
    if (!entitySelection) {
        return editorState
    }

    const newContentState = Modifier.removeRange(
        contentState,
        entitySelection,
        'forward',
    )
    const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'remove-range',
    )
    return EditorState.acceptSelection(newEditorState, selection)
}

export const getPredictionText = (
    entityKey: string,
    editorState: EditorState,
) => {
    return (
        editorState.getCurrentContent().getEntity(entityKey).getData() as {
            text: string
        }
    ).text
}

export const usePrediction = (entityKey: string, editorState: EditorState) => {
    const newEditorState = removePrediction(entityKey, editorState)
    const selection = newEditorState.getSelection()
    const currentContent = newEditorState.getCurrentContent()

    // insert each line in a new block
    const entityText = getPredictionText(entityKey, editorState)
    const predictionContentState = ContentState.createFromText(entityText)
    const newContentState = Modifier.replaceWithFragment(
        currentContent,
        selection,
        predictionContentState.getBlockMap(),
    )

    return EditorState.push(editorState, newContentState, 'insert-fragment')
}

export const removeFirstNCharsOfPrediction = (
    entityKey: string,
    editorState: EditorState,
    n: number,
): EditorState => {
    const selection = editorState.getSelection()
    const predictionText = getPredictionText(entityKey, editorState)
    const newEntityKey = createPrediction(
        predictionText.substring(n),
        editorState,
    )

    let newEditorState = removePrediction(entityKey, editorState)
    newEditorState = insertPrediction(newEntityKey, newEditorState)

    predictionKey.set(newEntityKey)
    cachedSelection.set(selection)

    return EditorState.acceptSelection(newEditorState, selection)
}

// It returns plain text stripping the prediction artifacts
export const getPlainTextFromStateWithPrediction = (
    editorState: EditorState,
): string => {
    const text = editorState.getCurrentContent().getPlainText()
    return text.slice(0, -1)
}

/**
 * Get entity keys that are referenced by blocks in valid contexts
 * - Excludes image/video entities that are not in atomic blocks
 * - Includes all other referenced entities
 */
const getValidReferencedEntityKeys = (
    blocks: RawDraftContentBlock[],
    entityMap: { [K in string]: any },
): Set<string> => {
    const validKeys = new Set<string>()

    blocks.forEach((block) => {
        block.entityRanges?.forEach((entityRange) => {
            const entityKey = String(entityRange.key)
            const entity = entityMap[entityKey]

            if (!entity) {
                return
            }

            // Image and video entities should only be in atomic blocks
            if (
                (entity.type === 'img' || entity.type === 'video') &&
                block.type !== 'atomic'
            ) {
                // Skip - invalid context for image/video entity
                return
            }

            validKeys.add(entityKey)
        })
    })

    return validKeys
}

export const convertToRawWithoutPredictions = (
    contentState: ContentState,
): {
    blocks: RawDraftContentBlock[]
    entityMap: {
        [K in string]: any
    }
} => {
    const rawContent = convertToRaw(contentState)
    const validKeys = getValidReferencedEntityKeys(
        rawContent.blocks,
        rawContent.entityMap,
    )

    return {
        blocks: rawContent.blocks.slice(),
        entityMap: _pickBy(rawContent.entityMap, (val, key) => {
            // Remove prediction entities
            if (val.type === PREDICTION_TYPE) {
                return false
            }
            // Remove entities that aren't referenced or are in invalid contexts
            if (!validKeys.has(key)) {
                return false
            }
            return true
        }),
    }
}
