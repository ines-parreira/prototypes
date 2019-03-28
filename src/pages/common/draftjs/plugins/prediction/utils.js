// @flow
import {EditorState, Modifier, ContentState} from 'draft-js'

import {getEntitySelectionState} from '../../../../../utils/editor'

export const createPrediction = (
    text: string,
    editorState: EditorState
): EditorState => {
    const currentContent = editorState.getCurrentContent()
    const entityContentState = currentContent.createEntity(
        'prediction',
        'IMMUTABLE',
        {text},
    )
    return entityContentState.getLastCreatedEntityKey()
}

export const insertPrediction = (entityKey: string, editorState: EditorState) => {
    const currentContent = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const textWithEntity = Modifier.insertText(currentContent, selection, ' ', null, entityKey)

    return EditorState.push(editorState, textWithEntity, 'insert-characters')
}

export const removePrediction = (entityKey: string, editorState: EditorState) => {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    let entitySelection = getEntitySelectionState(contentState, entityKey)
    // when sending the message with ctrl + enter, entitySelection is undefined
    if (!entitySelection) {
        return editorState
    }

    const newContentState = Modifier.removeRange(contentState, entitySelection, 'forward')
    const newEditorState = EditorState.push(editorState, newContentState, 'remove-range')
    return EditorState.acceptSelection(newEditorState, selection)
}

export const usePrediction = (entityKey: string, editorState: EditorState) => {
    let newEditorState = removePrediction(entityKey, editorState)
    let selection = newEditorState.getSelection()
    let currentContent = newEditorState.getCurrentContent()

    // insert each line in a new block
    const entityText = editorState.getCurrentContent().getEntity(entityKey).getData().text
    const predictionContentState = ContentState.createFromText(entityText)
    const newContentState = Modifier.replaceWithFragment(
        currentContent,
        selection,
        predictionContentState.getBlockMap()
    )

    return EditorState.push(editorState, newContentState, 'insert-fragment')
}
