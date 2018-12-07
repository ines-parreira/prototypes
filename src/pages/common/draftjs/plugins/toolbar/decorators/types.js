//@flow
import type { EditorStateGetter, EditorStateSetter } from '../types'
import { ContentState } from 'draft-js'
import { type Node } from 'react'

export type ComponentProps = {
    children?: Node,
    entityKey: string,
    contentState: ContentState,
    decoratedText: string,
    getEditorState: EditorStateGetter,
    setEditorState: EditorStateSetter,
    offsetKey: string
}

export type StrategyCallback = (start?: number, end?: number) => void
