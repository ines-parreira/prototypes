import type { KeyboardEvent } from 'react'

import { EditorState, KeyBindingUtil, Modifier } from 'draft-js'

import { EditorHandledNotHandled } from '../../../../../utils/editor'
import type { Plugin, PluginMethods } from '../types'

const COMMAND = 'clear-formatting'
const INLINE_STYLES = ['BOLD', 'ITALIC', 'UNDERLINE']

const createClearFormattingPlugin = (): Plugin => {
    let pluginMethods: PluginMethods

    return {
        initialize(methods: PluginMethods) {
            pluginMethods = methods
        },

        keyBindingFn(event: KeyboardEvent) {
            if (
                KeyBindingUtil.hasCommandModifier(event) &&
                event.key === '\\'
            ) {
                event.preventDefault()
                return COMMAND
            }

            return undefined
        },

        handleKeyCommand(command: string, editorState: EditorState) {
            if (command !== COMMAND) {
                return EditorHandledNotHandled.NotHandled
            }

            const selection = editorState.getSelection()

            if (selection.isCollapsed()) {
                return EditorHandledNotHandled.Handled
            }

            let contentState = editorState.getCurrentContent()

            for (const style of INLINE_STYLES) {
                contentState = Modifier.removeInlineStyle(
                    contentState,
                    selection,
                    style,
                )
            }

            const newEditorState = EditorState.push(
                editorState,
                contentState,
                'change-inline-style',
            )

            pluginMethods.setEditorState(newEditorState)
            return EditorHandledNotHandled.Handled
        },
    }
}

export default createClearFormattingPlugin
