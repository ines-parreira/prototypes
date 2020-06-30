// @flow
import {EditorState, type SelectionState} from 'draft-js'
import axios, {Cancel, CancelToken} from 'axios'
import type {Map} from 'immutable'

import type {Plugin, PluginMethods} from '../types'

import {
    createPrediction,
    getPlainTextFromStateWithPrediction,
    getPredictionText,
    insertPrediction,
    removeFirstNCharsOfPrediction,
    removePrediction,
    usePrediction,
} from './utils'
import decorators from './decorators'

let predictionKey = null
let cachedSelection = null

export const setPredictionKey = (value: string) => {
    predictionKey = value
}

export const setCachedSelection = (value: SelectionState) => {
    cachedSelection = value
}

let predictionCache = []
export const clearCache = () => (predictionCache = [])
const inCache = (text: string) => predictionCache.includes((text || '').trim())
const addCache = (text: string) => predictionCache.push((text || '').trim())

let cancelTokenSource = null
const cancelApiRequest = () => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel()
    }

    cancelTokenSource = CancelToken.source()
    return cancelTokenSource.token
}

const currentPrediction: {
    inputText: string,
    predictionText: string,
    numberAcceptedCharacters: number,
} = {
    inputText: '',
    predictionText: '',
    numberAcceptedCharacters: 0,
}
const resetCurrentPrediction = (
    inputText?: string = '',
    predictionText?: string = ''
) => {
    currentPrediction.inputText = inputText
    currentPrediction.predictionText = predictionText
    currentPrediction.numberAcceptedCharacters = 0
}

const removeExistingPrediction = (editorState) => {
    if (predictionKey) {
        const newEditorState = removePrediction(predictionKey, editorState)
        predictionKey = null
        return newEditorState
    }

    return editorState
}

const requestPrediction = (
    text: string = '',
    context: Map<*, *>,
    plugin: PluginMethods
) => {
    return axios
        .post(
            window.PHRASE_PREDICTION_URL,
            {
                query: text,
                context: context.toJS(),
            },
            {
                cancelToken: cancelApiRequest(),
                timeout: 2000,
            }
        )
        .then((res) => {
            const predictionText = res.data.prediction
            if (!predictionText) {
                return
            }
            addCache(text)

            const editorState = plugin.getEditorState()
            const selection = editorState.getSelection()

            const newEditorState = removeExistingPrediction(editorState)
            predictionKey = createPrediction(predictionText, newEditorState)

            plugin.setEditorState(
                EditorState.forceSelection(
                    insertPrediction(predictionKey, newEditorState),
                    selection
                )
            )

            resetCurrentPrediction(text, predictionText)
        })
        .catch((err) => {
            // ignore request cancel
            if (err instanceof Cancel) {
                return
            }

            throw err
        })
}

const sendFeedback = async (
    context: Map<*, *>,
    addedText: string,
    editorState: EditorState
) => {
    if (!predictionKey) {
        return
    }

    const predictionText = getPredictionText(predictionKey, editorState)
    let acceptedPredictionChars = 0
    let charIndex = 0
    while (
        charIndex < predictionText.length &&
        charIndex < addedText.length &&
        predictionText.charAt(charIndex) === addedText.charAt(charIndex)
    ) {
        charIndex++
        acceptedPredictionChars++
    }

    currentPrediction.numberAcceptedCharacters += acceptedPredictionChars

    await axios.post(window.PHRASE_FEEDBACK_URL, {
        query_text: currentPrediction.inputText,
        query_context: context.toJS(),
        result_prediction_text: currentPrediction.predictionText,
        result_prediction_accepted:
            predictionText.length === acceptedPredictionChars,
        result_number_accepted_characters:
            currentPrediction.numberAcceptedCharacters,
        diverged_phrase: null,
    })

    resetCurrentPrediction()
}

const completePrediction = (
    event: KeyboardEvent,
    plugin: PluginMethods,
    config: Object
) => {
    if (!predictionKey) {
        return
    }
    event.preventDefault()

    const editorState = plugin.getEditorState()
    sendFeedback(
        config.context,
        getPredictionText(predictionKey, editorState),
        editorState
    )

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const newEditorState = usePrediction(predictionKey, editorState)
    predictionKey = null
    plugin.setEditorState(newEditorState)
}

const predictionPlugin = (config: {context: Map<*, *>}): Plugin => {
    return {
        decorators,
        onChange: (editorState: EditorState, plugin: PluginMethods) => {
            const selection = editorState.getSelection()
            const contentState = editorState.getCurrentContent()

            // if cursor wasn't moved, skip this change event.
            // it was caused by plugin.setEditorState
            if (cachedSelection === selection) {
                return editorState
            }
            cachedSelection = selection

            // clear cache on empty content
            if (!contentState.hasText()) {
                clearCache()
            }

            if (predictionKey) {
                const predictionText = getPredictionText(
                    predictionKey,
                    editorState
                )
                const currentText = getPlainTextFromStateWithPrediction(
                    editorState
                )
                const prevText = getPlainTextFromStateWithPrediction(
                    EditorState.undo(editorState)
                )
                const charNumDiff = currentText.length - prevText.length
                const addedText =
                    charNumDiff > 0 ? currentText.slice(-charNumDiff) : ''

                // Update the prediction if there's an input that matches the prediction and doesn't complete it
                if (
                    addedText &&
                    predictionText.startsWith(addedText) &&
                    addedText.length < predictionText.length
                ) {
                    currentPrediction.numberAcceptedCharacters +=
                        addedText.length
                    return removeFirstNCharsOfPrediction(
                        predictionKey,
                        editorState,
                        addedText.length
                    )
                }

                sendFeedback(config.context, addedText, editorState)
            }

            cancelApiRequest()
            // remove prediction on cursor move or text change
            let newEditorState = removeExistingPrediction(editorState)

            const currentBlockKey = selection.getStartKey()

            // only from current block
            const currentBlock = newEditorState
                .getCurrentContent()
                .getBlockForKey(currentBlockKey)
            if (!currentBlock) {
                return newEditorState
            }

            const start = selection.getStartOffset()
            const blockText = currentBlock.getText() || ''

            if (
                // only for caret
                selection.isCollapsed() &&
                // and at the end of the block
                start === blockText.length &&
                // and text is longer than 1 char
                blockText.length > 1 &&
                // and not in cache
                !inCache(blockText)
            ) {
                requestPrediction(blockText, config.context, plugin)
                return newEditorState
            }

            return newEditorState
        },
        onTab: (event: KeyboardEvent, plugin: PluginMethods) =>
            completePrediction(event, plugin, config),
        onRightArrow: (event: KeyboardEvent, plugin: PluginMethods) =>
            completePrediction(event, plugin, config),
    }
}

export default predictionPlugin
