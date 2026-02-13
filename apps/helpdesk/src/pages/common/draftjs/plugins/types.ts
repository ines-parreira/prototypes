import type { ComponentType, KeyboardEvent, ReactNode } from 'react'

import type { ContentBlock, ContentState, EditorState } from 'draft-js'

import type { UploadType } from 'common/types'

import type { notify } from '../../../../state/notifications/actions'
import type { ConnectedAction } from '../../../../state/types'

export type PluginMethods = {
    getEditorState: () => EditorState
    setEditorState: (editorState: EditorState) => void
    getProps: () => any
}

export type ImagePluginConfig = {
    notify: ConnectedAction<typeof notify>
    getAttachFiles: () => (T: Array<File>) => void
    getCanDropFiles: () => boolean
    getCanInsertInlineImages: () => boolean
    uploadType?: UploadType
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
        contentState: ContentState,
    ) => void
    component: ComponentType<DecoratorComponentProps>
}

export type Plugin = {
    initialize?: (pluginMethods: PluginMethods) => void
    decorator?: Decorator
    decorators?: Decorator[]
    blockRendererFn?: (
        contentBlock: ContentBlock,
        pluginMethods: PluginMethods,
    ) => Maybe<Record<string, unknown>>
    keyBindingFn?: (
        event: KeyboardEvent,
        pluginMethods: PluginMethods,
    ) => Maybe<string>
    handleBeforeInput?: (
        chars: string,
        editorState: EditorState,
        pluginMethods: PluginMethods,
    ) => string
    handleKeyCommand?: (
        key: string,
        editorState: EditorState,
        pluginMethods: PluginMethods,
    ) => string
    handleReturn?: (
        event: KeyboardEvent,
        editorState: EditorState,
        pluginMethods: PluginMethods,
    ) => string
    onChange?: (
        editorState: EditorState,
        pluginMethods: PluginMethods,
    ) => EditorState
    onTab?: (event: KeyboardEvent, plugin: PluginMethods) => void
    onDownArrow?: (event: KeyboardEvent, plugin: PluginMethods) => void
    onUpArrow?: (event: KeyboardEvent, plugin: PluginMethods) => void
    onLeftArrow?: (event: KeyboardEvent, plugin: PluginMethods) => void
    onRightArrow?: (event: KeyboardEvent, plugin: PluginMethods) => void
}
