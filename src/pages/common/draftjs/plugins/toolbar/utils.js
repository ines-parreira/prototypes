import {RichUtils, Entity} from 'draft-js'
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

        // disable style on links and links on style
        // TODO @jebarjonet remove this after https://github.com/HubSpot/draft-convert/pull/17 is resolved
        if (!updatedAction.isDisabled) {
            updatedAction.isDisabled = (getEditorState) => {
                const editorState = getEditorState()

                const isLink = updatedAction.label === 'Link'

                let preventAction = false
                const selection = editorState.getSelection()

                // get all blocks
                const blocks = editorState.getCurrentContent().getBlocksAsArray()

                // check if a origin block is after a target block
                const isBlockAfter = (originBlockKey, targetBlockKey, strict = false) => {
                    const originIndex = blocks.findIndex(b => b.getKey() === originBlockKey)
                    const targetIndex = blocks.findIndex(b => b.getKey() === targetBlockKey)
                    return strict ? originIndex < targetIndex : originIndex <= targetIndex
                }

                // check if two blocks are the same
                const isSameBlock = (originBlockKey, targetBlockKey) => {
                    return originBlockKey === targetBlockKey
                }

                // check if a block is between two other blocks
                const isBlockBetween = (targetBlockKey, startBlockKey, endBlockKey, strict) => {
                    return isBlockAfter(startBlockKey, targetBlockKey, strict)
                        && isBlockAfter(targetBlockKey, endBlockKey, strict)
                }

                // check if a target block is being selected
                const isSelecting = (targetBlockKey, start, end) => {
                    // block in between start and end of selection, it is therefore selected
                    if (isBlockBetween(targetBlockKey, selection.getStartKey(), selection.getEndKey(), true)) {
                        return true
                    }

                    // block on the start edge of selection
                    if (isSameBlock(targetBlockKey, selection.getStartKey())) {
                        // block on the end edge of selection too: we are selecting only one block from start to end
                        if (isSameBlock(targetBlockKey, selection.getEndKey())) {
                            return selection.getStartOffset() <= end && selection.getEndOffset() >= start
                        }

                        return selection.getStartOffset() <= end
                    }

                    // block on the end edge of selection
                    if (isSameBlock(targetBlockKey, selection.getEndKey())) {
                        return selection.getEndOffset() >= start
                    }

                    return false
                }

                const selectedBlocks = blocks
                    .filter(block => isBlockBetween(block.getKey(), selection.getStartKey(), selection.getEndKey()))

                if (isLink) {
                    // if we are using a link button, prevent using it on a style
                    selectedBlocks.forEach((block) => {
                        block.findStyleRanges(
                            (character) => {
                                return character.get('style').size > 0
                            },
                            (start, end) => {
                                preventAction = isSelecting(block.getKey(), start, end)
                            }
                        )
                    })
                } else {
                    // if we are using a style button, prevent using it on a link
                    selectedBlocks.forEach((block) => {
                        block.findEntityRanges(
                            (character) => {
                                const entityKey = character.getEntity()
                                return entityKey !== null && Entity.get(entityKey).getType() === 'link'
                            },
                            (start, end) => {
                                preventAction = isSelecting(block.getKey(), start, end)
                            }
                        )
                    })
                }

                return preventAction
            }
        }

        return updatedAction
    })
}
