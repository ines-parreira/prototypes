import {RichUtils} from 'draft-js'
import actions from './actions'

export const getToolbarActions = () => {
    return actions.map((nativeAction) => {
        // complete toggle function configuration if not specified
        if (!nativeAction.toggle) {
            nativeAction.toggle = (block, action, editorState, setEditorState) => {
                setEditorState(RichUtils.toggleInlineStyle(
                    editorState,
                    action.style
                ))
            }
        }

        // complete active function configuration if not specified
        if (!nativeAction.active) {
            nativeAction.active = (block, editorState) => {
                const contentState = editorState.getCurrentContent()

                if (!contentState.hasText()) {
                    return false
                }

                const currentStyle = editorState.getCurrentInlineStyle()
                return currentStyle.has(nativeAction.style)
            }
        }

        // add a trigger function that will run `toggle`, but accepts simpler parameters
        nativeAction.trigger = (getEditorState, setEditorState) => {
            const editorState = getEditorState()
            const block = editorState
                .getCurrentContent()
                .getBlockForKey(editorState.getSelection().getStartKey())
            return nativeAction.toggle(block, nativeAction, editorState, setEditorState)
        }

        // add a isActive function that will run `active`, but accepts simpler parameters
        nativeAction.isActive = (getEditorState) => {
            const editorState = getEditorState()
            const block = editorState
                .getCurrentContent()
                .getBlockForKey(editorState.getSelection().getStartKey())
            return nativeAction.active(block, editorState)
        }

        return nativeAction
    })
}
