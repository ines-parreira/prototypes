import {EditorState, ContentState, ContentBlock} from 'draft-js'
import {ReactNode, ComponentType, KeyboardEvent} from 'react'

export type PluginMethods = {
    getEditorState: () => EditorState
    setEditorState: (editorState: EditorState) => void
    getProps: () => any
}

export type ImagePluginConfig = {
    notify: (notification: {status: string; message: string}) => void
    getAttachFiles: () => (T: Array<File>) => void
    getCanDropFiles: () => boolean
    getCanInsertInlineImages: () => boolean
}

export type DecoratorComponentProps = {
    children?: ReactNode
    entityKey: string
    contentState: ContentState
    decoratedText: string
    getEditorState: () => EditorState
    setEditorState: (editorState: EditorState) => any
    offsetKey: string
}

export type DecoratorStrategyCallback = (start?: number, end?: number) => void

export type Decorator = {
    strategy: (
        contentBlock: ContentBlock,
        decoratorStrategyCallback: DecoratorStrategyCallback,
        contentState: ContentState
    ) => void
    component: ComponentType<DecoratorComponentProps>
}

export type Plugin = {
    initialize?: (pluginMethods: PluginMethods) => void
    decorators?: Decorator[]
    blockRendererFn?: (
        contentBlock: ContentBlock,
        pluginMethods: PluginMethods
    ) => Maybe<Record<string, unknown>>
    keyBindingFn?: (
        event: KeyboardEvent,
        pluginMethods: PluginMethods
    ) => Maybe<string>
    handleKeyCommand?: (
        key: string,
        editorState: EditorState,
        pluginMethods: PluginMethods
    ) => string
    onChange?: (
        editorState: EditorState,
        pluginMethods: PluginMethods
    ) => EditorState
    onTab?: (event: KeyboardEvent, plugin: PluginMethods) => void
    onRightArrow?: (event: KeyboardEvent, plugin: PluginMethods) => void
}
