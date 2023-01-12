import {EditorState, ContentState, EditorChangeType} from 'draft-js'
import {fromJS} from 'immutable'

import addMention from '../addMention'

describe('addMention', () => {
    it('should add a mention', () => {
        const editorState = EditorState.push(
            EditorState.createEmpty(),
            ContentState.createFromText('@Bob'),
            'insert-mention' as EditorChangeType
        )
        const newEditorState = addMention(
            editorState,
            fromJS({name: 'Bob', id: 8}),
            '@',
            '@',
            'SEGMENTED'
        )
        const contentState = newEditorState.getCurrentContent()
        const entityKey = contentState.getLastCreatedEntityKey()
        const entity = contentState.getEntity(entityKey)
        expect(entity.getData()).toEqual({mention: {name: 'Bob', id: 8}})
    })
})
