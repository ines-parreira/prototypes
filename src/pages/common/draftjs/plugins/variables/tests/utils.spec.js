import {EditorState, ContentState} from 'draft-js'

import {setVariableEditable, attachEntitiesToVariables} from '../utils'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('Variables plugin utils', () => {
    describe('attachEntitiesToVariables', () => {
        it('should contain editable variable', () => {
            const contentState = ContentState.createFromText('{{current_user.name}}')
            const editorState = attachEntitiesToVariables(EditorState.createWithContent(contentState))

            const newContentState = editorState.getCurrentContent()
            const entityKey = newContentState.getLastCreatedEntityKey()

            expect(newContentState.getEntity(entityKey).getData().immutable).toBe(false)
        })

        it('should contain immutable variable', () => {
            const contentState = ContentState.createFromText('{{current_user.name}}')
            const editorState = attachEntitiesToVariables(EditorState.createWithContent(contentState), true)

            const newContentState = editorState.getCurrentContent()
            const entityKey = newContentState.getLastCreatedEntityKey()

            expect(newContentState.getEntity(entityKey).getData().immutable).toBe(true)
        })
    })

    describe('setVariableEditable', () => {
        it('should turn immutable variable to editable', () => {
            const contentState = ContentState.createFromText('{{current_user.name}}')
            let editorState = attachEntitiesToVariables(EditorState.createWithContent(contentState), true)
            let newEditorState

            const newContentState = editorState.getCurrentContent()
            const entityKey = newContentState.getLastCreatedEntityKey()
            const blockKey = newContentState.getLastBlock().get('key')

            editorState = setVariableEditable({
                entityKey,
                offsetKey: blockKey,
                getEditorState: () => editorState,
                setEditorState: (e) => newEditorState = e
            })

            const newEntityKey = newEditorState.getCurrentContent().getLastCreatedEntityKey()
            expect(newEditorState.getCurrentContent().getEntity(newEntityKey).getData().immutable).toBe(false)
        })
    })
})
