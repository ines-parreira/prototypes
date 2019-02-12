import {EditorState, CompositeDecorator} from 'draft-js'
import _isArray from 'lodash/isArray'

import {convertFromHTML} from '../../../../utils/editor'

export const editorStateFromHtml = (html) => {
    const editorState = EditorState.createEmpty()
    const contentState = convertFromHTML(html)
    return EditorState.push(editorState, contentState)
}

export const applyPluginsToEditorState = (editorState, plugins) => {
    plugins.forEach((plugin) => {
        if (plugin.onChange) {
            editorState = plugin.onChange(editorState)
        }
    })
    return editorState
}

export const getCompositeDecorator = (decorators = []) => {
    if (!_isArray(decorators)) {
        decorators = [decorators]

    }

    return new CompositeDecorator(decorators)
}

export const isOccupied = (array) => {
    return array.every((character) => character !== null)
}

export const isEntirelyNull = (array) => {
    return array.every((character) => character === null)
}
