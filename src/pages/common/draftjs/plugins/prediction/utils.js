// @flow
import {ContentState, EditorState, Modifier} from 'draft-js'

import {getEntitySelectionState} from '../../../../../utils/editor'

import {setCachedSelection, setPredictionKey} from './index'

const PREDICTION_TYPE = 'prediction'

export const createPrediction = (
    text: string,
    editorState: EditorState
): EditorState => {
    const currentContent = editorState.getCurrentContent()
    const entityContentState = currentContent.createEntity(
        PREDICTION_TYPE,
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

export const getPredictionText = (entityKey: string, editorState: EditorState) => {
    return editorState.getCurrentContent().getEntity(entityKey).getData().text
}

export const usePrediction = (entityKey: string, editorState: EditorState) => {
    let newEditorState = removePrediction(entityKey, editorState)
    let selection = newEditorState.getSelection()
    let currentContent = newEditorState.getCurrentContent()

    // insert each line in a new block
    const entityText = getPredictionText(entityKey, editorState)
    const predictionContentState = ContentState.createFromText(entityText)
    const newContentState = Modifier.replaceWithFragment(
        currentContent,
        selection,
        predictionContentState.getBlockMap()
    )

    return EditorState.push(editorState, newContentState, 'insert-fragment')
}

export const removeFirstNCharsOfPrediction = (entityKey: string, editorState: EditorState, n: number): EditorState => {
    const selection = editorState.getSelection()
    const predictionText = getPredictionText(entityKey, editorState)
    const newEntityKey = createPrediction(predictionText.substring(n), editorState)

    let newEditorState = removePrediction(entityKey, editorState)
    newEditorState = insertPrediction(newEntityKey, newEditorState)

    setPredictionKey(newEntityKey)
    setCachedSelection(selection)

    return EditorState.acceptSelection(newEditorState, selection)
}

// It returns plain text stripping the prediction artifacts
export const getPlainTextFromStateWithPrediction = (editorState: EditorState): string => {
    const text = editorState.getCurrentContent().getPlainText()
    return text.slice(0, -1)
}
