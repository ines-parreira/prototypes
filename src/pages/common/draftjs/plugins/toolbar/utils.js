import {RichUtils} from 'draft-js'
import _forEach from 'lodash/forEach'

import actions from './actions'

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

