import type { KeyboardEvent } from 'react'

import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'
import { EditorState } from 'draft-js'
import type { Map } from 'immutable'
import { debounce } from 'lodash'

import type { Plugin, PluginMethods } from '../types'
import client from './client'
import decorators from './decorators'
import { cachedSelection, predictionKey } from './state'
import {
    createPrediction,
    getPlainTextFromStateWithPrediction,
    getPredictionText,
    insertPrediction,
    removeFirstNCharsOfPrediction,
    removePrediction,
    usePrediction,
} from './utils'

let predictionCache: string[] = []
export const clearCache = () => (predictionCache = [])
const inCache = (text: string) => predictionCache.includes((text || '').trim())
const addCache = (text: string) => predictionCache.push((text || '').trim())

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
    const preKey = predictionKey.get()
    if (preKey) {
        const newEditorState = removePrediction(preKey, editorState)
        predictionKey.set(null)
        return newEditorState
    }

    return editorState
}

const requestPrediction = async (
    text = '',
    context: Map<any, any>,
    plugin: PluginMethods,
) => {
    if (!getLDClient()?.variation(FeatureFlagKey.MLFeaturesKillswitch)) return

    const predictionText = await client.requestPrediction(text, context.toJS())

    if (!predictionText) {
        return
    }
    addCache(text)

    const editorState = plugin.getEditorState()
    const selection = editorState.getSelection()

    const newEditorState = removeExistingPrediction(editorState)
    const preKey = createPrediction(predictionText, newEditorState)
    predictionKey.set(preKey)

    const newSelection = selection.merge({ hasFocus: true })
    plugin.setEditorState(
        EditorState.forceSelection(
            insertPrediction(preKey, newEditorState),
            newSelection,
        ),
    )

    resetCurrentPrediction(text, predictionText)
}

const sendFeedback = async (
    context: Map<any, any>,
    addedText: string,
    editorState: EditorState,
    tabKeyUsed = false,
) => {
    const preKey = predictionKey.get()
    if (!preKey) {
        return
    }

    const predictionText = getPredictionText(preKey, editorState)
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

    await client.sendFeedback({
        queryText: currentPrediction.inputText,
        queryContext: context.toJS(),
        resultPredictionText: currentPrediction.predictionText,
        resultPredictionAccepted:
            predictionText.length === acceptedPredictionChars && tabKeyUsed,
        resultNumberAcceptedCharacters:
            currentPrediction.numberAcceptedCharacters,
        divergedPhrase: null,
        tabKeyUsed,
    })

    resetCurrentPrediction()
}

const completePrediction = (
    event: KeyboardEvent,
    plugin: PluginMethods,
    config: { context: Map<any, any> },
) => {
    const preKey = predictionKey.get()
    if (!preKey) {
        return
    }
    event.preventDefault()

    const editorState = plugin.getEditorState()
    void sendFeedback(
        config.context,
        getPredictionText(preKey, editorState),
        editorState,
        true,
    )

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const newEditorState = usePrediction(preKey, editorState)
    predictionKey.set(null)
    plugin.setEditorState(newEditorState)
}

const predictionPlugin = (config: {
    context: Map<any, any>
    debounce?: number
}): Plugin => {
    let lastQuery: string | null = null
    const debouncedRequestPrediction = debounce(
        requestPrediction,
        typeof config.debounce === 'number' ? config.debounce : 200,
        {
            leading: true,
            trailing: true,
        },
    )

    return {
        // $TsFixMe remove casting once decorators is migrated
        decorators: decorators as any,
        onChange: (editorState: EditorState, plugin: PluginMethods) => {
            const selection = editorState.getSelection()
            const contentState = editorState.getCurrentContent()

            // if cursor wasn't moved, skip this change event.
            // it was caused by plugin.setEditorState
            if (cachedSelection.get() === selection) {
                return editorState
            }
            cachedSelection.set(selection)

            // clear cache on empty content
            if (!contentState.hasText()) {
                clearCache()
            }

            const preKey = predictionKey.get()
            if (preKey) {
                const predictionText = getPredictionText(preKey, editorState)
                const currentText =
                    getPlainTextFromStateWithPrediction(editorState)
                const prevText = getPlainTextFromStateWithPrediction(
                    EditorState.undo(editorState),
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
                        preKey,
                        editorState,
                        addedText.length,
                    )
                }

                void sendFeedback(config.context, addedText, editorState)
            }

            client.cancelPredictionRequest()
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
                blockText.trim().length > 1 &&
                // and not in cache
                !inCache(blockText) &&
                // and content has changed
                // (focus/blur events trigger onChange)
                blockText !== lastQuery
            ) {
                lastQuery = blockText
                config.debounce
                    ? void debouncedRequestPrediction(
                          blockText,
                          config.context,
                          plugin,
                      )
                    : void requestPrediction(blockText, config.context, plugin)
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
