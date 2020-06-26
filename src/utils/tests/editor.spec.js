//@flow
import {
    AtomicBlockUtils,
    CompositeDecorator,
    ContentBlock,
    ContentState,
    EditorState,
    Modifier,
    SelectionState,
} from 'draft-js'
import React, {type Node} from 'react'

import * as utils from '../editor'

describe('editor utils', () => {
    describe('toHTML', () => {
        it('should convert links (www.xxx.com) to html', () => {
            const text = 'Hello there\n\nwww.google.com'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hello there</div><br><div><a href="http://www.google.com" class="linkified" target="_blank">www.google.com</a></div>')
        })

        it('should convert links (xxx.com) to html', () => {
            const text = 'Hello there\n\ngoogle.com'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hello there</div><br><div><a href="http://google.com" class="linkified" target="_blank">google.com</a></div>')
        })

        it('should convert multiple links to html', () => {
            const text = 'Hey There!\n\nwww.google.com\n\nAnother link: http://www.gorgias.io'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hey There!</div><br><div><a href="http://www.google.com" class="linkified" target="_blank">www.google.com</a></div><br><div>Another link: <a href="http://www.gorgias.io" class="linkified" target="_blank">http://www.gorgias.io</a></div>')
        })

        it('should NOT convert adjacent links to html correctly (www.xxx.comwww.yyy.com)', () => {
            const text = 'Hey Marie Curie,\nmultiple links: www.facebook.comwww.github.com\n\nThanks for contacting us.'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hey Marie Curie,</div><div>multiple links: <a href="http://www.facebook.comwww.github.com" class="linkified" target="_blank">www.facebook.comwww.github.com</a></div><br><div>Thanks for contacting us.</div>')
        })

        it('should wrap images in inline-block figures', () => {
            const baseHTML = '<figure><img src="https://gorgias.io/" /></figure>'
            const contentState = utils.convertFromHTML(baseHTML)
            const newHTML = utils.convertToHTML(contentState)
            expect(newHTML).toEqual('<figure style="display: inline-block; margin: 0"><img src="https://gorgias.io/" width="400px" style="max-width: 100%"></figure>')
        })

        // tests interaction between convertToHTML and convertFromHTML.
        it('should turn images into atomic blocks', () => {
            // create an editor state with an image
            const entityKey = ContentState
                .createFromText('')
                .createEntity('img', 'IMMUTABLE', {src: ''})
                .getLastCreatedEntityKey()
            let editorState = AtomicBlockUtils.insertAtomicBlock(
                EditorState.createEmpty(),
                entityKey,
                ' ',
            )
            // convert ContentState to plain html
            const wrappedHTML = utils.convertToHTML(editorState.getCurrentContent())
            // convert resulted html back to ContentState
            const contentState = utils.convertFromHTML(wrappedHTML)
            expect(contentState.getBlocksAsArray().find((b) => b.type === 'atomic')).toBeTruthy()
        })

        it('should convert links with {{variables}} to html', () => {
            const text = 'Hello there\n\nwww.google.com/{{ticket.id}}'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hello there</div><br><div><a href="http://www.google.com/{{ticket.id}}" class="linkified" target="_blank">www.google.com/{{ticket.id}}</a></div>')
        })

        it('should turn newlines into br', () => {
            const text = 'One\nTwo\n\nThree\n\n\n'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>One</div><div>Two</div><br><div>Three</div><br><br><br>')
        })
    })

    describe('from HTML', () => {
        it('should ONLY unescape template variables', () => {
            const baseHTML = '<div><a href="http://{{ticket.account.domain}}.gorgias.io/app/ticket/{{ticket.id}}/hel%7B%7Bhello%7D%7D" target="_blank">link</a></div>'
            const contentState = utils.convertFromHTML(baseHTML)
            const newHTML = utils.convertToHTML(contentState)
            expect(newHTML).toEqual(baseHTML)
        })

        it('should convert image to img entity', () => {
            const baseHTML = '<img src="https://gorgias.io/">'
            const contentState = utils.convertFromHTML(baseHTML)
            const entityKey = contentState.getFirstBlock().getEntityAt(0)
            expect(contentState.getEntity(entityKey).getType()).toEqual('img')
        })

        it('should convert image to img entity with data', () => {
            const baseHTML = '<img src="https://gorgias.io/">'
            const contentState = utils.convertFromHTML(baseHTML)
            const entityKey = contentState.getFirstBlock().getEntityAt(0)
            expect(contentState.getEntity(entityKey).getData()).toEqual({src: 'https://gorgias.io/', width: 400})
        })

        it('should not add a newline at the end of an unstyled block', () => {
            const baseHTML = '<div>A<br></div>B'
            const contentState = utils.convertFromHTML(baseHTML)
            expect(contentState.getFirstBlock().get('text')).toEqual('A')
        })

        it('should maintain multiple newlines at the end of a block', () => {
            const baseHTML = '<div>A<br><br><br /></div>B'
            const contentState = utils.convertFromHTML(baseHTML)
            expect(contentState.getFirstBlock().get('text')).toEqual('A\n\n')
        })

        it('should maintain newlines outside blocks', () => {
            const baseHTML = '<div>A</div><br><br />B'
            const contentState = utils.convertFromHTML(baseHTML)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks[0].get('text')).toEqual('A')
            expect(blocks[1].get('text')).toEqual('')
            expect(blocks[2].get('text')).toEqual('')
            expect(blocks[3].get('text')).toEqual('B')
        })

        it('should remove newlines from newline-only blocks', () => {
            const baseHTML = 'A<div><br></div>B'
            const contentState = utils.convertFromHTML(baseHTML)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks[0].get('text')).toEqual('A')
            expect(blocks[1].get('text')).toEqual('')
            expect(blocks[2].get('text')).toEqual('B')
        })
    })

    describe('unescape template variables', () => {
        it('should ONLY unescape template variables', () => {
            expect(utils.unescapeTemplateVars('%7Bh%7B%7Bello%7D%7D %7B%7Bticket.customer.email%7D%7D %7B%7Bmessage.from_agent%7D%7D %7B%7Bevent.type%7D%7D'))
                .toEqual('%7Bh%7B%7Bello%7D%7D {{ticket.customer.email}} {{message.from_agent}} {{event.type}}')
        })

        it('should NOT unescape variables (invalid template variables)', () => {
            expect(utils.unescapeTemplateVars('hello %7B%7Baccount.id%7D%7D'))
                .toEqual('hello %7B%7Baccount.id%7D%7D')
            expect(utils.unescapeTemplateVars('hello %7B%7Bintegrations.data%7D%7D 7B%hello 7B%7B%hello7%D7%D'))
                .toEqual('hello %7B%7Bintegrations.data%7D%7D 7B%hello 7B%7B%hello7%D7%D')
        })
    })

    describe('contentStateFromTextOrHTML', () => {
        it('should use html value if provided', () => {
            const html = '<b>bar</b>'
            const contentState = utils.contentStateFromTextOrHTML('foo', html)
            expect(contentState.getPlainText()).toBe('bar')
        })

        it('should fallback to text value if html not provided', () => {
            const contentState = utils.contentStateFromTextOrHTML('foo')
            expect(contentState.getPlainText()).toBe('foo')
        })
    })

    describe('getSelectedText()', () => {
        it('should return selected text', () => {
            const text = 'Elit culpa tempor enim sunt pariatur do deserunt adipisicing nisi.'
            const contentState = ContentState.createFromText(text)
            const block = contentState.getFirstBlock()
            const [start, end] = [3, 14]
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', start)
                .set('focusOffset', end)
            const selectedText = utils.getSelectedText(contentState, selection)
            expect(selectedText).toBe(text.slice(start, end))
        })

        it('should return empty string if selection is collapsed', () => {
            const text = 'Elit culpa tempor enim sunt pariatur do deserunt adipisicing nisi.'
            const contentState = ContentState.createFromText(text)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
            const selectedText = utils.getSelectedText(contentState, selection)
            expect(selectedText).toBe('')
        })
    })

    describe('getSelectedEntityKey()', () => {
        it('should return entity key when whole entity is selected', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = utils.convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).set('focusOffset', 3)
            const entityKey = utils.getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return entity key when part of the entity is selected', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = utils.convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 1)
                .set('focusOffset', 2)
            const entityKey = utils.getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return falsy value when cursor is right before the entity', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = utils.convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
            const entityKey = utils.getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })

        it('should return entity key when cursor is right after the entity', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = utils.convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 4)
                .set('focusOffset', 4)
            const entityKey = utils.getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return falsy value when cursor is outside the entity', () => {
            const html = '<a href="http://google.com">link</a> '
            const contentState = utils.convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 5)
                .set('focusOffset', 5)
            const entityKey = utils.getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })

        it('should return falsy value when more than the entity is selected', () => {
            const html = 'foo <a href="http://google.com">link</a> bar'
            const contentState = utils.convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).set('focusOffset', 9)
            const entityKey = utils.getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })
    })

    describe('removeMentions', () => {
        it('should remove only mentions', () => {
            let contentState = utils.convertFromHTML('@Foo <a href="http://gorgias.io">Gorgias</a>')
            contentState = contentState.createEntity('mention', 'SEGMENTED')
            const entityKey = contentState.getLastCreatedEntityKey()
            const selection = SelectionState
                .createEmpty(contentState.getFirstBlock().getKey())
                .set('focusOffset', 4)
            contentState = Modifier.replaceText(
                contentState,
                selection,
                '@Foo',
                null, // no inline style needed
                entityKey,
            )
            const editorState = EditorState.createWithContent(contentState)
            const newEditorState = utils.removeMentions(editorState)
            const newBlock = newEditorState.getCurrentContent().getFirstBlock()
            expect(newBlock.getEntityAt(0)).toBe(null)
            expect(newBlock.getEntityAt(5)).not.toBe(null)
        })
    })

    describe('refreshEditor', () => {
        it('should create a copy that doesnt pass the equality check', () => {
            const contentState = ContentState.createFromText('foo bar baz')
            const decorators = new CompositeDecorator([{
                strategy: (contentBlock: ContentBlock, callback) => callback(0, 1),
                component: (props: { children: Node }) => <span>{props.children}</span>,
            }])
            let editorState = EditorState.createWithContent(contentState, decorators)
            const updatedContentState = Modifier.insertText(
                contentState,
                editorState.getSelection(),
                'abc',
            )
            editorState = EditorState.push(
                editorState,
                updatedContentState,
                'insert-characters',
            )
            const newEditorState = utils.refreshEditor(editorState)
            expect(newEditorState).not.toBe(editorState)
            expect(newEditorState.getSelection()).toBe(editorState.getSelection())
            expect(newEditorState.getCurrentContent()).toBe(editorState.getCurrentContent())
            expect(newEditorState.getDecorator()).toBe(decorators)
            expect(newEditorState.getRedoStack()).toBe(editorState.getRedoStack())
            expect(newEditorState.getUndoStack()).toBe(editorState.getUndoStack())
            expect(newEditorState.getLastChangeType()).toBe(editorState.getLastChangeType())
        })
    })

    describe('isValidSelectionKey', () => {
        const editorState1 = EditorState.createWithContent(ContentState.createFromText('foo'))
        const editorState2 = EditorState.createWithContent(ContentState.createFromText('bar'))

        it('should return true for selection from the same editorState', () => {
            expect(utils.isValidSelectionKey(editorState1, editorState1.getSelection())).toBe(true)
        })

        it('should return false for selection from some other editorState', () => {
            expect(utils.isValidSelectionKey(editorState1, editorState2.getSelection())).toBe(false)
        })

        it('should return false if anchor key is valid but focus key is not', () => {
            const selection = editorState1.getSelection().set('focusKey', 'blabla')
            expect(utils.isValidSelectionKey(editorState1, selection)).toBe(false)
        })

        it('should return false for selection not updated after pushing new state', () => {
            const contentState = ContentState.createFromText('baz')
            const newEditorState = EditorState.push(editorState1, contentState)
            expect(utils.isValidSelectionKey(newEditorState, editorState1.getSelection())).toBe(false)
        })
    })

    describe('getPlainText()', () => {
        it('should return link url in plaintext', () => {
            const html = '<a href="http://gorgias.io">link</a>'
            const contentState = utils.convertFromHTML(html)
            expect(utils.getPlainText(contentState)).toBe('link: http://gorgias.io/')
        })

        it('should return link url in mixed plaintext', () => {
            const html = 'One <a href="http://gorgias.io">gorgias</a> link'
            const contentState = utils.convertFromHTML(html)
            expect(utils.getPlainText(contentState)).toBe('One gorgias: http://gorgias.io/ link')
        })

        it('should return link urls for multiple same-line entities', () => {
            const html = ''
                + 'One <a href="http://gorgias.io">gorgias</a>'
                + ' link <a href="https://gorgias.io/features">home</a> and back'
            const contentState = utils.convertFromHTML(html)
            expect(utils.getPlainText(contentState)).toBe('One gorgias: http://gorgias.io/ link home: https://gorgias.io/features and back')
        })

        it('should return link url in multiline plaintext', () => {
            const html = ''
                + 'First line<br>'
                + 'One <a href="http://gorgias.io">gorgias</a> link<br>'
                + 'Last line'
            const contentState = utils.convertFromHTML(html)
            expect(utils.getPlainText(contentState)).toBe('First line\nOne gorgias: http://gorgias.io/ link\nLast line')
        })

        it('should omit the link content if it is the same as the link url ', () => {
            const html = 'One <a href="http://gorgias.io">gorgias</a> and <a href="http://google.com/">http://google.com/</a> end.'
            const contentState = utils.convertFromHTML(html)
            expect(utils.getPlainText(contentState)).toBe('One gorgias: http://gorgias.io/ and http://google.com/ end.')
        })

        it('should ignore the url link ending slash', () => {
            const html = 'a <a href="http://gorgias.io/">http://gorgias.io</a> b.'
            const contentState = utils.convertFromHTML(html)
            expect(utils.getPlainText(contentState)).toBe('a http://gorgias.io b.')
        })

        it('should return regular getPlainText in strings with unicode chars', () => {
            const html = '👀<a href="http://gorgias.io">link</a>'
            const contentState = utils.convertFromHTML(html)
            expect(utils.getPlainText(contentState)).toBe('👀link')
        })
    })
})
