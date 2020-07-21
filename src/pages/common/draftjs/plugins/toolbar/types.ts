import type {EditorState} from 'draft-js'
import type {ReactNode} from 'react'

export enum ActionName {
    Bold = 'BOLD',
    Italic = 'ITALIC',
    Underline = 'UNDERLINE',
    Link = 'LINK',
    Image = 'IMAGE',
    Emoji = 'EMOJI',
}

export type EditorStateSetter = (editorState: EditorState) => any

export type EditorStateGetter = () => EditorState

export type ActionInjectedProps = {
    getEditorState: EditorStateGetter
    setEditorState: EditorStateSetter
}

export type Config = {
    imageDecorator?: (node: ReactNode) => ReactNode
    theme?: any
    getDisplayedActions: () => Maybe<ActionName[]>
    onLinkEdit: (entityKey: string, text: string, url: string) => void
    onLinkCreate: (text: string) => void
}
