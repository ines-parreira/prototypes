import {createContext, useContext} from 'react'
import {ContentBlock, ContentState} from 'draft-js'

export type CodeEditorContextApi = {
    openBlockKey: string
    setBlockKey: (key: string) => void
    removeBlockKey: () => void
    saveContent: (fragment: ContentState) => void
    removeContent: (atomicBlock: ContentBlock, fragment: ContentState) => void
}

export const CodeEditorContext = createContext<CodeEditorContextApi>({
    openBlockKey: '',
    removeBlockKey: () => null,
    setBlockKey: () => null,
    saveContent: () => null,
    removeContent: () => null,
})

export const useCodeEditorContext = (): CodeEditorContextApi => {
    return useContext(CodeEditorContext)
}
