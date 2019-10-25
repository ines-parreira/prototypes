// @flow
import {EditorState, Modifier, ContentState} from 'draft-js'
import _range from 'lodash/range'
import _some from 'lodash/some'

import {getEntitySelectionState} from '../../../../../utils/editor'

import {setCachedSelection, setPredictionKey} from './index'


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

export const removeFirstCharOfPrediction = (entityKey: string, editorState: EditorState) => {
    const selection = editorState.getSelection()
    const predictionText = getPredictionText(entityKey, editorState)
    const newEntityKey = createPrediction(predictionText.substring(1), editorState)

    let newEditorState = removePrediction(entityKey, editorState)
    newEditorState = insertPrediction(newEntityKey, newEditorState)

    setPredictionKey(newEntityKey)
    setCachedSelection(selection)

    return EditorState.acceptSelection(newEditorState, selection)
}

export const isTypingPrediction = (entityKey: string, editorState: EditorState) => {
    let currentText = editorState.getCurrentContent().getPlainText()
    // a trailing whitespace is added by the prediction plugin, so we need to remove it before comparing
    currentText = currentText.substring(0, currentText.length - 1)
    const currentPrediction = getPredictionText(entityKey, editorState)

    let predictionSubstrings = []

    // We use `length - 1` because we don't want to match the whole prediction: if the content already ends
    // with it, we want to remove it
    _range(currentPrediction.length - 1).forEach((idx: number) => {
        // We use idx + 1 because we don't want to match the substring "empty string"
        predictionSubstrings.push(currentPrediction.substring(0, idx + 1))
    })

    return _some(predictionSubstrings, (substring) => currentText.endsWith(substring))
}

export const hasTypedPrediction = (entityKey: string, editorState: EditorState) => {
    let currentText = editorState.getCurrentContent().getPlainText()
    // a trailing whitespace is added by the prediction plugin, so we need to remove it before comparing
    currentText = currentText.substring(0, currentText.length - 1)
    const currentPrediction = getPredictionText(entityKey, editorState)

    return currentText.endsWith(currentPrediction)
}
