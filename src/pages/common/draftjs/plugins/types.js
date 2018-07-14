import type {EditorState} from 'draft-js'

export type pluginArgsType = {
    getEditorState: () => EditorState,
    setEditorState: (T: EditorState) => void
}

export type imagePluginConfigType = {
    notify: ({status: string, message: string}) => void,
    getAttachFiles: () => (T: Array<Blob>) => void,
    getCanDropFiles: () => boolean,
    getCanInsertInlineImages: () => boolean
}
