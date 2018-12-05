//@flow
import { EditorState} from 'draft-js'

export type ActionName = 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'LINK' | 'IMAGE' | 'EMOJI'

export type EditorStateSetter = EditorState => any

export type EditorStateGetter = () => EditorState

export type ActionInjectedProps = {
    getEditorState: EditorStateGetter,
    setEditorState: EditorStateSetter
}
