// @flow
import {EditorState} from 'draft-js'
import axios, {CancelToken, Cancel} from 'axios'
import type {Map} from 'immutable'

import type {PluginMethods} from '../types'

import {createPrediction, insertPrediction, removePrediction, usePrediction} from './utils'
import decorators from './decorators'

let predictionKey = null
let cachedSelection = null

let predictionCache = []
const clearCache = () => predictionCache = []
const inCache = (text: string) => predictionCache.includes((text || '').trim())
const addCache = (text: string) => predictionCache.push((text || '').trim())

const endpoint = window.PHRASE_PREDICTION_URL

let cancelTokenSource = null
const cancelApiRequest = () => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel()
    }

    cancelTokenSource = CancelToken.source()
    return cancelTokenSource.token
}

const removeExistingPrediction = (editorState) => {
    if (predictionKey) {
        const newEditorState = removePrediction(predictionKey, editorState)
        predictionKey = null
        return newEditorState
    }

    return editorState
}

const apiRequest = (
    text: string = '',
    context: Map<*, *>,
    plugin: PluginMethods
) => {
    return axios.post(endpoint, {
        query: text,
        context: context.toJS()
    }, {
        cancelToken: cancelApiRequest(),
        timeout: 2000
    }).then((res) => {
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
    }).catch((err) => {
        // ignore request cancel
        if (err instanceof Cancel) {
            return
        }

        throw err
    })
}

const completePrediction = (e: KeyboardEvent, plugin: PluginMethods) => {
    if (!predictionKey) {
        return
    }
    e.preventDefault()

    const newEditorState = usePrediction(predictionKey, plugin.getEditorState())
    predictionKey = null
    plugin.setEditorState(newEditorState)
}

const predictionPlugin = (config: { context: Map<*, *> }) => {
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
                selection.isCollapsed()
                // and at the end of the block
                && start === blockText.length
                // and text is longer than 2 chars
                && blockText.length > 1
                // and not in cache
                && !inCache(blockText)
            ) {
                apiRequest(blockText, config.context, plugin)
                return newEditorState
            }

            return newEditorState
        },
        onTab: completePrediction,
        onRightArrow: completePrediction,
    }
}

export default predictionPlugin
