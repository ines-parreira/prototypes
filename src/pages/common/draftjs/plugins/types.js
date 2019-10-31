//@flow
import type {EditorState, ContentState, ContentBlock} from 'draft-js'
import type {Node, ComponentType} from 'react'

export type PluginMethods = {
    getEditorState: () => EditorState,
    setEditorState: EditorState => void,
    getProps: () => any
}

export type imagePluginConfigType = {
    notify: ({status: string, message: string}) => void,
    getAttachFiles: () => (T: Array<File>) => void,
    getCanDropFiles: () => boolean,
    getCanInsertInlineImages: () => boolean
}

export type DecoratorComponentProps = {
    children?: Node,
    entityKey: string,
    contentState: ContentState,
    decoratedText: string,
    getEditorState: () => EditorState,
    setEditorState: EditorState => any,
    offsetKey: string
}

export type DecoratorStrategyCallback = (start?: number, end?: number) => void

export type Decorator = {
    strategy: (ContentBlock, DecoratorStrategyCallback, ContentState) => void,
    component: ComponentType<DecoratorComponentProps>
}

export type Plugin = {
    initialize?: PluginMethods => void,
    decorators?: Decorator[],
    blockRendererFn?: (ContentBlock, PluginMethods) => ?Object,
    keyBindingFn?: (SyntheticKeyboardEvent<*>, PluginMethods) => ?string,
    handleKeyCommand?: (string, EditorState, PluginMethods) => string,
    onChange?: (EditorState, PluginMethods) => EditorState,
    onTab?: (event: KeyboardEvent, plugin: PluginMethods) => void,
    onRightArrow?: (event: KeyboardEvent, plugin: PluginMethods) => void,
}
