import {EditorState} from 'draft-js'
import {ReactNode} from 'react'

export enum ActionName {
    Bold = 'BOLD',
    Italic = 'ITALIC',
    Underline = 'UNDERLINE',
    Link = 'LINK',
    Image = 'IMAGE',
    Video = 'VIDEO',
    Emoji = 'EMOJI',
    ProductPicker = 'PRODUCTPICKER',
    DiscountCodePicker = 'DISCOUNTCODE',
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
    getDisplayedActions: () => ActionName[] | null | undefined
    onLinkEdit: (entityKey: string, text: string, url: string) => void
    onLinkCreate: (text: string) => void
}
