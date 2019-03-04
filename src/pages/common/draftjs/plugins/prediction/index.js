// @flow
import {EditorState} from 'draft-js'
import axios, {CancelToken} from 'axios'
import type {Map} from 'immutable'

import type {PluginMethods} from '../types'

import {createPrediction, insertPrediction, removePrediction, usePrediction} from './utils'
import decorators from './decorators'

let predictionKey = null
let cachedSelection = null
let cancelTokenSource = null

let predictionCache = []
const clearCache = () => predictionCache = []
const inCache = (text: string) => predictionCache.includes((text || '').trim())
const addCache = (text: string) => predictionCache.push((text || '').trim())

const endpoint = window.PHRASE_PREDICTION_URL

const apiRequest = (
    text: string = '',
    context: Map<*, *>,
    plugin: PluginMethods
) => {
    cancelTokenSource = CancelToken.source()
    return axios.post(endpoint, {
        query: text,
        context: context.toJS()
    }, {
        cancelToken: cancelTokenSource.token,
    }).then((res) => {
        const predictionText = res.data.prediction
        if (!predictionText) {
            return
        }
        addCache(text)

        const editorState = plugin.getEditorState()
        const selection = editorState.getSelection()

        predictionKey = createPrediction(predictionText, editorState)

        plugin.setEditorState(
            EditorState.forceSelection(
                insertPrediction(predictionKey, editorState),
                selection
            )
        )
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

            if (cancelTokenSource) {
                cancelTokenSource.cancel()
            }

            // remove prediction on cursor move or text change
            if (predictionKey) {
                const newEditorState = removePrediction(predictionKey, editorState)
                predictionKey = null
                return newEditorState
            }

            const currentBlockKey = selection.getStartKey()

            // only from current block
            const currentBlock = contentState.getBlockForKey(currentBlockKey)
            if (!currentBlock) {
                return editorState
            }

            const start = selection.getStartOffset()
            const end = selection.getEndOffset()

            const blockText = currentBlock.getText() || ''

            if (
                // only if we don't have a selection
                start === end
                // and at the end of the block
                && start === blockText.length
                // and text is longer than 2 chars
                && blockText.length > 1
                // and not in cache
                && !inCache(blockText)
            ) {
                apiRequest(blockText, config.context, plugin)
                return editorState
            }

            return editorState
        },
        onTab: completePrediction,
        onRightArrow: completePrediction,
    }
}

export default predictionPlugin
