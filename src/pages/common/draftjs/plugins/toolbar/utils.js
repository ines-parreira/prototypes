import {EditorState, Modifier, SelectionState, RichUtils} from 'draft-js'
import findWithRegex from 'find-with-regex'
import _forEach from 'lodash/forEach'
import _trim from 'lodash/trim'
import _get from 'lodash/get'

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
 * @param immutable
 * @returns {*}
 */
export const attachEntitiesToVariables = (editorState, immutable = false) => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let newContentState = contentState

    blocks.forEach((block) => {
        const plainText = block.getText()

        // find variables in block to remove them if invalid,
        // or turn them immutable.
        // can't use addEntityToVariable because it only loops
        // entities that match the templateRegex.
        block.findEntityRanges(
            (character) => {
                if (character.getEntity() !== null) {
                    const entity = newContentState.getEntity(character.getEntity())
                    if (entity && entity.get('type') === 'variable') {
                        return true
                    }
                }
                return false
            },
            (start, end) => {
                const value = plainText.substring(start, end)
                const entityKey = block.getEntityAt(start)
                if (entityKey) {
                    const entity = newContentState.getEntity(entityKey)
                    const entityData = entity.get('data')
                    if (entity && entity.get('type') === 'variable') {
                        // turn variable immutable
                        if (immutable && !_get(entityData, 'immutable')) {
                            newContentState = newContentState.mergeEntityData(entityKey, {
                                immutable: true
                            })
                        }

                        // remove invalid variable
                        if (value !== _get(entityData, 'result')) {
                            const entitySelection = SelectionState.createEmpty(block.getKey())
                                .set('anchorOffset', start)
                                .set('focusOffset', end)

                            newContentState = Modifier.applyEntity(
                                newContentState,
                                entitySelection,
                                null
                            )
                        }
                    }
                }
            }
        )

        // refresh the block pointer, in case we changed it
        const newBlock = newContentState.getBlockForKey(block.getKey())
        const addEntityToVariable = (start, end) => {
            const existingEntityKey = newBlock.getEntityAt(start)
            // avoid manipulation in case the variable already has an entity
            if (existingEntityKey) {
                const entity = newContentState.getEntity(existingEntityKey)
                if (entity && entity.get('type') === 'variable') {
                    return
                }
            }

            const selection = SelectionState.createEmpty(newBlock.getKey())
                .set('anchorOffset', start)
                .set('focusOffset', end)
            const value = plainText.substring(start, end)
            const variable = ticketConfig.getVariableWithValue(_trim(value, '{}'))

            if (!variable) {
                return
            }

            // check if there used to be a variable here, and restore immutable data.
            // fixes bug with turning an immutable variable to editable,
            // when typing one char after it.
            const oldEntityKey = block.getEntityAt(start)
            if (oldEntityKey) {
                const oldEntity = newContentState.getEntity(oldEntityKey)
                const entityData = oldEntity.get('data')
                if (_get(entityData, 'result') === value) {
                    immutable = _get(entityData, 'immutable')
                }
            }

            const entityContentState = contentState.createEntity(
                'variable',
                'MUTABLE',
                {
                    ...variable,
                    immutable,
                    result: value,
                }
            )
            const entityKey = entityContentState.getLastCreatedEntityKey()
            newContentState = Modifier.replaceText(
                newContentState,
                selection,
                value,
                null,
                entityKey,
            )
        }

        findWithRegex(templateRegex, newBlock, addEntityToVariable)
    })

    if (!newContentState.equals(contentState)) {
        const newEditorState = EditorState.push(
            editorState,
            newContentState,
            'attach-entity-variables',
        )
        const currentSelection = editorState.getSelection()

        // only if editor is focused,
        // so we don't steal focus from elsewhere when rendering the editor.
        if (currentSelection.getHasFocus()) {
            // restore selection after replaceText
            return EditorState.forceSelection(newEditorState, currentSelection)
        }

        return newEditorState
    }

    return editorState
}

const KEY_SEPARATOR = '-'
export const setVariableEditable = ({entityKey, offsetKey, getEditorState, setEditorState}) => {
    const editorState = getEditorState()
    const contentState = editorState.getCurrentContent()
    let newContentState = contentState.mergeEntityData(entityKey, {
        immutable: false,
    })
    let offset = 0

    // get blockKey from offsetKey
    // https://github.com/Soreine/draft-js-simpledecorator/blob/4cd96de586724dd146f57cabef4b8fb15714060d/index.js#L59
    const blockKey = _get(offsetKey.split(KEY_SEPARATOR), 0)
    if (!blockKey) {
        return
    }

    // find entity position in block
    const contentBlock = newContentState.getBlockForKey(blockKey)
    contentBlock.findEntityRanges((character) => {
        return entityKey === character.getEntity()
    }, (start) => offset = start)

    // set selection at start of variable
    const selection = SelectionState.createEmpty(blockKey).set('anchorOffset', offset).set('focusOffset', offset)

    return setEditorState(
        // mergeEntityData doesn't trigger a re-render,
        // so we forceSelection to force the editor re-render.
        EditorState.forceSelection(
            EditorState.push(
                editorState,
                newContentState,
                'set-variable-editable',
            ),
            selection
        )
    )
}
