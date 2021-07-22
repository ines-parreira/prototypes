import {KeyboardEvent} from 'react'
import {EditorState, SelectionState} from 'draft-js'
import axios, {CancelTokenSource} from 'axios'
import {Map} from 'immutable'

import {Plugin, PluginMethods} from '../types'
import {reportError} from '../../../../../utils/errors'

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

let predictionKey: string | null = null
let cachedSelection: SelectionState | null = null

export const setPredictionKey = (value: string) => {
    predictionKey = value
}

export const setCachedSelection = (value: SelectionState) => {
    cachedSelection = value
}

let predictionCache: string[] = []
export const clearCache = () => (predictionCache = [])
const inCache = (text: string) => predictionCache.includes((text || '').trim())
const addCache = (text: string) => predictionCache.push((text || '').trim())

let cancelTokenSource: CancelTokenSource | null = null
const cancelApiRequest = () => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel()
    }

    cancelTokenSource = axios.CancelToken.source()
    return cancelTokenSource.token
}

const currentPrediction: {
    inputText: string
    predictionText: string
    numberAcceptedCharacters: number
} = {
    inputText: '',
    predictionText: '',
    numberAcceptedCharacters: 0,
}
const resetCurrentPrediction = (inputText = '', predictionText = '') => {
    currentPrediction.inputText = inputText
    currentPrediction.predictionText = predictionText
    currentPrediction.numberAcceptedCharacters = 0
}

const removeExistingPrediction = (editorState: EditorState) => {
    if (predictionKey) {
        const newEditorState = removePrediction(predictionKey, editorState)
        predictionKey = null
        return newEditorState
    }

    return editorState
}

const requestPrediction = (
    text = '',
    context: Map<any, any>,
    plugin: PluginMethods
) => {
    return axios
        .post<{prediction: string}>(
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
            if (
                axios.isCancel(err) ||
                (axios.isAxiosError(err) && !err.response)
            ) {
                return
            }

            throw err
        })
}

const sendFeedback = async (
    context: Map<any, any>,
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
    config: {context: Map<any, any>}
) => {
    if (!predictionKey) {
        return
    }
    event.preventDefault()

    const editorState = plugin.getEditorState()
    void sendFeedback(
        config.context,
        getPredictionText(predictionKey, editorState),
        editorState
    )

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const newEditorState = usePrediction(predictionKey, editorState)
    predictionKey = null
    plugin.setEditorState(newEditorState)
}

const predictionPlugin = (config: {context: Map<any, any>}): Plugin => {
    return {
        // $TsFixMe remove casting once decorators is migrated
        decorators: decorators as any,
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

                void sendFeedback(config.context, addedText, editorState)
            }

            cancelApiRequest()
            // remove prediction on cursor move or text change
            const newEditorState = removeExistingPrediction(editorState)

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
                void requestPrediction(blockText, config.context, plugin).catch(
                    reportError
                )
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
