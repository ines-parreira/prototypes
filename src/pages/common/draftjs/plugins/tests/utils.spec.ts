import {EditorState} from 'draft-js'

import {removeLink} from '../utils'
import {convertFromHTML} from '../../../../../utils/editor'

describe('plugin utils', () => {
    describe('removeLink()', () => {
        it('should remove the link if entity exists', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const entityKey = contentState.getFirstBlock().getEntityAt(0)
            const editorState = EditorState.createWithContent(contentState)
            const newEditorState = removeLink(entityKey, editorState)
            expect(
                newEditorState
                    .getCurrentContent()
                    .getFirstBlock()
                    .getEntityAt(0)
            ).toBeFalsy()
        })

        it('should move the selection after the entity', () => {
            const html = '<a href="http://google.com">link</a> foo bar'
            const contentState = convertFromHTML(html)
            const entityKey = contentState.getFirstBlock().getEntityAt(0)
            const editorState = EditorState.createWithContent(contentState)
            const newEditorState = removeLink(entityKey, editorState)
            const selection = newEditorState.getSelection()
            expect(selection.getStartOffset()).toBe(4)
            expect(selection.getEndOffset()).toBe(4)
        })

        it('should remove the link if entity exists', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const editorState = EditorState.createWithContent(contentState)
            const newEditorState = removeLink('fooKey', editorState)
            expect(
                newEditorState
                    .getCurrentContent()
                    .getFirstBlock()
                    .getEntityAt(0)
            ).not.toBeFalsy()
        })
    })
})
