//@flow
import { ContentState, SelectionState, EditorState } from 'draft-js'
import { getSelectedText, getSelectedEntityKey, removeLink } from '../utils'
import { convertFromHTML } from '../../../../../utils/editor'

describe('plugin utils', () => {
    describe('getSelectedText()', () => {
        it('should return selected text', () => {
            const text = 'Elit culpa tempor enim sunt pariatur do deserunt adipisicing nisi.'
            const contentState = ContentState.createFromText(text)
            const block = contentState.getFirstBlock()
            const [start, end] = [3, 14]
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', start)
                .set('focusOffset', end)
            const selectedText = getSelectedText(contentState, selection)
            expect(selectedText).toBe(text.slice(start, end))
        })

        it('should return empty string if selection is collapsed', () => {
            const text = 'Elit culpa tempor enim sunt pariatur do deserunt adipisicing nisi.'
            const contentState = ContentState.createFromText(text)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
            const selectedText = getSelectedText(contentState, selection)
            expect(selectedText).toBe('')
        })
    })

    describe('getSelectedEntityKey()', () => {
        it('should return entity key when whole entity is selected', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).set('focusOffset', 3)
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return entity key when part of the entity is selected', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 1)
                .set('focusOffset', 2)
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return falsy value when cursor is right before the entity', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })

        it('should return entity key when cursor is right after the entity', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 4)
                .set('focusOffset', 4)
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return falsy value when cursor is outside the entity', () => {
            const html = '<a href="http://google.com">link</a> '
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 5)
                .set('focusOffset', 5)
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })

        it('should return falsy value when more than the entity is selected', () => {
            const html = 'foo <a href="http://google.com">link</a> bar'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).set('focusOffset', 9)
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })
    })

    describe('removeLink()', () => {
        it('should remove the link if entity exists', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const entityKey = contentState.getFirstBlock().getEntityAt(0)
            const editorState = EditorState.createWithContent(contentState)
            const newEditorState = removeLink(entityKey, editorState)
            expect(newEditorState.getCurrentContent().getFirstBlock().getEntityAt(0)).toBeFalsy()
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
            expect(newEditorState.getCurrentContent().getFirstBlock().getEntityAt(0)).not.toBeFalsy()
        })
    })
})
