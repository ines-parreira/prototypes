import {EditorState} from 'draft-js'

import {linkifyWithTemplate, removeLink} from '../utils'
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

        it('should parse the link ending with a template variable', () => {
            const url = 'https://www.gorgias.com/app/ticket/{{ticket.id}}'
            const parsedUrl = linkifyWithTemplate(url)
            expect(parsedUrl).toBe(
                'https://www.gorgias.com/app/ticket/{{ticket.id}}'
            )
        })

        it('should parse the link containing multiple template variables', () => {
            const url =
                'https://www.gorgias.com/app/ticket/{{ticket.id}}/messages/{{ticket.message.id}}/detail'
            const parsedUrl = linkifyWithTemplate(url)
            expect(parsedUrl).toBe(
                'https://www.gorgias.com/app/ticket/{{ticket.id}}/messages/{{ticket.message.id}}/detail'
            )
        })
    })
})
