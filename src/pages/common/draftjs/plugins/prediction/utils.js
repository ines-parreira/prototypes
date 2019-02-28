// @flow
import {EditorState, Modifier} from 'draft-js'

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

    return EditorState.push(editorState, textWithEntity, 'insert-prediction')
}

export const removePrediction = (entityKey: string, editorState: EditorState) => {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const entitySelection = getEntitySelectionState(contentState, entityKey)
    // when sending the message with ctrl + enter, entitySelection is undefined
    if (!entitySelection) {
        return editorState
    }

    const newContentState = Modifier.removeRange(contentState, entitySelection, 'forward')
    const newEditorState = EditorState.push(editorState, newContentState, 'remove-prediction')

    return EditorState.acceptSelection(newEditorState, selection)
}

export const usePrediction = (entityKey: string, editorState: EditorState) => {
    const entityText = editorState.getCurrentContent().getEntity(entityKey).getData().text

    let newEditorState = removePrediction(entityKey, editorState)
    const selection = newEditorState.getSelection()
    const contentState = newEditorState.getCurrentContent()
    const newContentState = Modifier.insertText(contentState, selection, entityText)

    return EditorState.push(editorState, newContentState, 'use-prediction')
}
