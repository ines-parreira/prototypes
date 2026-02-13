declare module 'draft-js-plugins-editor' {
    import { Component, ReactNode, MouseEvent, KeyboardEvent } from 'react'
    import { EditorState, DraftEditorCommand } from 'draft-js'

    import { Plugin, PluginMethods } from 'pages/common/draftjs/plugins/types'

    type Props = {
        editorState: EditorState
        onChange: (editorState: EditorState) => void
        onFocus?: (event: MouseEvent<HTMLDivElement>) => void
        onBlur?: () => void
        plugins?: Plugin[]
        handleKeyCommand?: (command: DraftEditorCommand) => string
        handlePastedText?: (
            text: string,
            html: string | undefined,
            editorState: EditorState,
        ) => string | undefined
        readOnly?: boolean
        placeholder?: string
        editorKey?: string
        tabIndex?: number
        spellCheck?: boolean
        keyBindingFn?: (
            event: KeyboardEvent,
        ) => DraftEditorCommand | string | null | undefined
        [key: string]: any
    }

    class EditorPlugin extends Component<Props> {
        focus: () => void

        getEditorKey: () => string

        resolvePlugins: () => Plugin[]

        getPluginMethods: () => PluginMethods
    }

    namespace EditorPlugin {
        function composeDecorators(
            decorator: ReactNode,
        ): (decorators: ReactNode) => ReactNode
    }

    export = EditorPlugin
}
