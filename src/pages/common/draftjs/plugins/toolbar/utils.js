//@flow
import { ContentBlock, EditorState, RichUtils } from 'draft-js'
import actions from './actions'
import type { Action, ToolbarAction, EditorStateGetter } from './types'

export const getToolbarActions = (toolbarProps: any = {}) =>
    actions.map((action: Action): ToolbarAction => {
        const partialToolbarAction = {
            ...action,
            toolbarProps,
            active: action.active || ((block: ContentBlock, editorState: EditorState) => {
                const contentState = editorState.getCurrentContent()

                if (!contentState.hasText()) {
                    return false
                }

                const currentStyle = editorState.getCurrentInlineStyle()
                return currentStyle.has(action.style)
            }),
            componentFunctions: action.componentFunctions || {
                toggle: (block, action, editorState, setEditorState) => () =>
                    setEditorState(RichUtils.toggleInlineStyle(
                        editorState,
                        action.style
                    ))
            },
            isDisabled: () => false
        }
        return ({
            ...partialToolbarAction,
            isActive: (getEditorState: EditorStateGetter) => {
                const editorState = getEditorState()
                const block = editorState
                    .getCurrentContent()
                    .getBlockForKey(editorState.getSelection().getStartKey())
                return partialToolbarAction.active(block, editorState)
            }
        })
    })
