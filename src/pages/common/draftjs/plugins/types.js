import type {EditorState} from 'draft-js'

export type pluginArgsType = {
    getEditorState: () => EditorState,
    setEditorState: (T: EditorState) => void
}

export type imagePluginConfigType = {
    attachFiles: (T: Array<Blob>) => void,
    notify: ({status: string, message: string}) => void,
    getCanDropFiles: () => boolean,
    getCanInsertInlineImages: () => boolean
}
