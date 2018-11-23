//@flow
import type { ComponentType } from 'react'
import { EditorState, ContentBlock } from 'draft-js'

export type ActionComponentProps = {
    name: string,
    icon?: string,
    isActive: boolean,
    isDisabled: boolean
}

export type ActionComponent = ComponentType<$Subtype<ActionComponentProps>>

export type EditorStateSetter = EditorState => any

export type EditorStateGetter = () => EditorState

export type ActionComponentPropCreator = (
    block: ContentBlock,
    action: ToolbarAction,
    editorState: EditorState,
    setEditorState: EditorStateSetter
) => any

export type Action = {
    key: string,
    name: string,
    icon?: string,
    style?: string,
    active?: (block: ContentBlock, editorState: EditorState) => boolean,
    component?: ActionComponent,
    componentFunctions?: {
        [string]: ActionComponentPropCreator
    }
}

export type ToolbarAction = Action & {
    toolbarProps: any,
    isActive: (EditorStateGetter) => boolean,
    isDisabled: (EditorStateGetter) => boolean,
    active: $PropertyType<Action, 'active'>,
    componentFunctions: $PropertyType<Action, 'componentFunctions'>
}

// Emoji-mart object https://github.com/missive/emoji-mart#examples-of-emoji-object
export type Emoji = {
    id: string,
    name: string,
    colons: string,
    text: string,
    emoticons: string[],
    native: string,
    skin: ?number,
}
