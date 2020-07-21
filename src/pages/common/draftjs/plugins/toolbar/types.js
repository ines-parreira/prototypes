//@flow
import {EditorState} from 'draft-js'
import type {Node} from 'react'

export type ActionName =
    | 'BOLD'
    | 'ITALIC'
    | 'UNDERLINE'
    | 'LINK'
    | 'IMAGE'
    | 'EMOJI'

export type EditorStateSetter = (EditorState) => any

export type EditorStateGetter = () => EditorState

export type ActionInjectedProps = {
    getEditorState: EditorStateGetter,
    setEditorState: EditorStateSetter,
}

export type Config = {
    imageDecorator?: (Node) => Node,
    theme?: any,
    getDisplayedActions: () => ?(ActionName[]),
    onLinkEdit: (entityKey: string, text: string, url: string) => void,
    onLinkCreate: (text: string) => void,
}
