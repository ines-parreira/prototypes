//@flow
import type {EditorState} from 'draft-js'

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
