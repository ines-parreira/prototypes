import {EditorState, Modifier, SelectionState, Entity, RichUtils} from 'draft-js'
import findWithRegex from 'find-with-regex'
import _forEach from 'lodash/forEach'
import _trim from 'lodash/trim'

import actions from './actions'

import * as ticketConfig from '../../../../../config/ticket'

import {templateRegex} from '../../../utils/template'

export const getToolbarActions = () => {
    return actions.map((nativeAction) => {
        const updatedAction = {...nativeAction} // clone native action

        // complete toggle function configuration if not specified
        if (!updatedAction.functions) {
            updatedAction.functions = {
                toggle: (block, action, editorState, setEditorState) => {
                    return setEditorState(RichUtils.toggleInlineStyle(
                        editorState,
                        action.style
                    ))
                }
            }
        }

        // complete active function configuration if not specified
        if (!updatedAction.active) {
            updatedAction.active = (block, editorState) => {
                const contentState = editorState.getCurrentContent()

                if (!contentState.hasText()) {
                    return false
                }

                const currentStyle = editorState.getCurrentInlineStyle()
                return currentStyle.has(updatedAction.style)
            }
        }

        // for each functions of the action, bind the same function but accepting simpler parameters
        const functions = {}
        _forEach(updatedAction.functions, (func, name) => {
            functions[name] = (getEditorState, setEditorState, ...other) => {
                const editorState = getEditorState()
                const block = editorState
                    .getCurrentContent()
                    .getBlockForKey(editorState.getSelection().getStartKey())
                return func(block, updatedAction, editorState, setEditorState, ...other)
            }
        })
        updatedAction.functions = functions

        // add a isActive function that will run `active`, but accepts simpler parameters
        updatedAction.isActive = (getEditorState) => {
            const editorState = getEditorState()
            const block = editorState
                .getCurrentContent()
                .getBlockForKey(editorState.getSelection().getStartKey())
            return updatedAction.active(block, editorState)
        }

        if (!updatedAction.isDisabled) {
            // useless for now but could be useful at some point
            updatedAction.isDisabled = (getEditorState) => { //eslint-disable-line
                return false
            }
        }

        return updatedAction
    })
}

/**
 * Transform variables (ex: {ticket.requester.name}) in visual tag
 * Inspired by https://github.com/draft-js-plugins/draft-js-plugins/blob/48937265675faeb2fb6b9ca623f6424d75dc2fb2/draft-js-emoji-plugin/src/modifiers/attachImmutableEntitiesToEmojis.js
 * @param editorState
 * @returns {*}
 */
export const attachImmutableEntitiesToVariables = (editorState) => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let newContentState = contentState

    blocks.forEach((block) => {
        const plainText = block.getText()

        const addEntityToVariable = (start, end) => {
            const existingEntityKey = block.getEntityAt(start)
            if (existingEntityKey) {
                // avoid manipulation in case the variable already has an entity
                const entity = Entity.get(existingEntityKey)
                if (entity && entity.get('type') === 'variable') {
                    return
                }
            }

            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', start)
                .set('focusOffset', end)
            const value = plainText.substring(start, end)

            const variable = ticketConfig.getVariableWithValue(_trim(value, '{}'))

            if (!variable) {
                return
            }

            const entityKey = Entity.create('variable', 'IMMUTABLE', {...variable, result: value})
            newContentState = Modifier.replaceText(
                newContentState,
                selection,
                value,
                null,
                entityKey,
            )
        }

        findWithRegex(templateRegex, block, addEntityToVariable)
    })

    if (!newContentState.equals(contentState)) {
        return EditorState.push(
            editorState,
            newContentState,
            'convert-to-immutable-variables',
        )
    }

    return editorState
}
