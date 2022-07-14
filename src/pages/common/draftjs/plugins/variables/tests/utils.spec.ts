import {EditorState, ContentState} from 'draft-js'

import {setVariableEditable, attachEntitiesToVariables} from '../utils'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('Variables plugin utils', () => {
    describe('attachEntitiesToVariables', () => {
        it('should contain editable variable', () => {
            const contentState = ContentState.createFromText(
                '{{current_user.name}}'
            )
            const editorState = attachEntitiesToVariables(
                EditorState.createWithContent(contentState)
            )

            const newContentState = editorState.getCurrentContent()
            const entityKey = newContentState.getLastCreatedEntityKey()
            const newContentStateData = newContentState
                .getEntity(entityKey)
                .getData() as Record<string, any>

            expect(newContentStateData.immutable).toBe(false)
        })

        it('should contain immutable variable', () => {
            const contentState = ContentState.createFromText(
                '{{current_user.name}}'
            )
            const editorState = attachEntitiesToVariables(
                EditorState.createWithContent(contentState),
                true
            )

            const newContentState = editorState.getCurrentContent()
            const entityKey = newContentState.getLastCreatedEntityKey()
            const newContentStateData = newContentState
                .getEntity(entityKey)
                .getData() as Record<string, any>
            expect(newContentStateData.immutable).toBe(true)
        })
    })

    describe('setVariableEditable', () => {
        it('should turn immutable variable to editable', () => {
            const contentState = ContentState.createFromText(
                '{{current_user.name}}'
            )
            let editorState = attachEntitiesToVariables(
                EditorState.createWithContent(contentState),
                true
            )
            const decoratedText = ''
            let newEditorState: EditorState

            const newContentState = editorState.getCurrentContent()
            const entityKey = newContentState.getLastCreatedEntityKey()
            const blockKey = newContentState.getLastBlock().get('key') as string

            editorState = setVariableEditable({
                entityKey,
                contentState,
                decoratedText,
                getEditorState: () => editorState,
                setEditorState: (e: EditorState) => (newEditorState = e),
                offsetKey: blockKey,
            })

            const newEntityKey = newEditorState!
                .getCurrentContent()
                .getLastCreatedEntityKey()

            const newEditorStateData = newEditorState!
                .getCurrentContent()
                .getEntity(newEntityKey)
                .getData() as Record<string, any>
            expect(newEditorStateData.immutable).toBe(false)
        })
    })
})
