// @flow
import {
    CompositeDecorator,
    ContentState,
    type DraftEntityInstance,
    EditorState,
    Modifier,
    SelectionState
} from 'draft-js'
import {Map} from 'immutable'
import {isArray, noop} from 'lodash'

import type {PluginMethods} from '../plugins/types'
import {convertFromHTML} from '../../../../utils/editor'

export const mockPlugin = (initialState: EditorState): PluginMethods => {
    let state = initialState || EditorState.createEmpty()
    return {
        getEditorState: () => {
            return state
        },
        setEditorState: (newState) => {
            state = newState
        },
        getProps: noop
    }
}

export const typeText = (editorState: EditorState, text: string): EditorState => {
    const selection = editorState.getSelection()

    const newContentState = Modifier.insertText(
        editorState.getCurrentContent(),
        selection,
        text
    )

    let newState = EditorState.push(
        editorState,
        newContentState,
        'insert-characters'
    )

    const newSelection = SelectionState.createEmpty(newContentState.getLastBlock().getKey())
        .set('anchorOffset', selection.getAnchorOffset() + text.length)
        .set('focusOffset', selection.getFocusOffset() + text.length)

    newState = EditorState.forceSelection(newState, newSelection)

    return newState
}

export const createEditorStateFromHtml = (html: string) => {
    const editorState = EditorState.createEmpty()
    const contentState = convertFromHTML(html)
    return EditorState.push(editorState, contentState)
}

export const createCompositeDecorator = (decorators?: any[] = []) => {
    if (!isArray(decorators)) {
        decorators = [decorators]
    }
    return new CompositeDecorator(decorators)
}

export const getLastCreatedEntity = (contentState: ContentState): ?DraftEntityInstance => {
    const key = contentState.getLastCreatedEntityKey()
    if (key === '0') {
        return null
    }
    return contentState.getEntity(key)
}

export type EntityRange = [number, number]

export const getLastCreatedEntityRange = (contentState: ContentState): ?EntityRange => {
    const key = contentState.getLastCreatedEntityKey()
    if (key === '0') {
        return null
    }
    let range
    contentState.blockMap.forEach((contentBlock) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && entityKey === key
            }, (...entityRange) => {
                range = entityRange
            }
        )
    })
    return range || null
}

export const createEntityAndApplyToFirstBlockRange = (
    editorState: EditorState,
    entity: DraftEntityInstance,
    range: EntityRange,
) => {
    const contentStateWithEntity = editorState.getCurrentContent()
        .createEntity(entity.type, entity.mutability, entity.data)
    const key = contentStateWithEntity.getLastCreatedEntityKey()
    const rangeSelection = SelectionState.createEmpty(contentStateWithEntity.getFirstBlock().getKey())
        .set('anchorOffset', range[0])
        .set('focusOffset', range[1])
    return EditorState.push(
        editorState,
        Modifier.applyEntity(contentStateWithEntity, rangeSelection, key),
        'insert-characters'
    )
}

// Returns human-readable selection textual representation, eg. "[startKey] startPosition - endPosition [endKey]".
// Useful if you want to have a quick check if the code under test plays nicely with the selections.
export const debugSelection = (selection: SelectionState): string => {
    const {anchorKey, anchorOffset, focusKey, focusOffset} = selection.toJS()
    let result = `[${anchorKey}] ${anchorOffset}`
    const theSameBlock = focusKey === anchorKey
    const theSameOffset = focusOffset === anchorOffset
    if (!theSameOffset && theSameBlock) {
        result += ` - ${focusOffset}`
    } else if (!theSameOffset || !theSameBlock) {
        result += ` - ${focusOffset} [${focusKey}]`
    }
    return result
}

export type BlockMapDebug = {
    [string]: string
}

// Returns a simplified block map plain-object representation that is easier to read.
export const debugBlockMap = (blockMap: Map<*, *>): BlockMapDebug => {
    return blockMap.toList()
        .toJS()
        .reduce((acc, {key, text}) => {
            return {
                ...acc,
                [key]: text
            }
        }, {})
}

export type LastEntityDebug = {
    range: ?EntityRange
} & DraftEntityInstance

// It returns the last created entity that is still applied somewhere in the content.
export const debugLastAppliedEntity = (contentState: ContentState): ?LastEntityDebug => {
    const lastEntity = getLastCreatedEntity(contentState)
    const range = getLastCreatedEntityRange(contentState)

    if (!lastEntity || !range) {
        return null
    }

    return {
        ...lastEntity.toJS(),
        range
    }
}

export type EditorStateDebug = {
    text: string,
    blocks: BlockMapDebug,
    selection: string,
    lastAppliedEntity: ?LastEntityDebug
}

// Utility function that returns most important data (eg. current text, selection, etc.)
// about editor state, in human-readable form.
export const debugEditorState = (editorState: ContentState): EditorStateDebug => {
    const content = editorState.getCurrentContent()
    return {
        text: content.getPlainText(),
        blocks: debugBlockMap(content.blockMap),
        selection: debugSelection(editorState.getSelection()),
        lastAppliedEntity: debugLastAppliedEntity(content)
    }
}
