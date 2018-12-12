import {AtomicBlockUtils, ContentState, EditorState, Modifier, SelectionState} from 'draft-js'
import * as utils from '../editor'
import {contentStateFromTextOrHTML, convertFromHTML, getSelectedEntityKey, getSelectedText} from '../editor'
import {removeMentions} from '../editor'

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
            expect(contentState.getBlocksAsArray().find(b => b.type === 'atomic')).toBeTruthy()
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
            const contentState = contentStateFromTextOrHTML('foo', html)
            expect(contentState.getPlainText()).toBe('bar')
        })

        it('should fallback to text value if html not provided', () => {
            const contentState = contentStateFromTextOrHTML('foo')
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

    describe('removeMentions', () => {
        it('should remove only mentions', () => {
            let contentState = convertFromHTML('@Foo <a href="http://gorgias.io">Gorgias</a>')
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
                entityKey
            )
            const editorState = EditorState.createWithContent(contentState)
            const newEditorState = removeMentions(editorState)
            const newBlock = newEditorState.getCurrentContent().getFirstBlock()
            expect(newBlock.getEntityAt(0)).toBe(null)
            expect(newBlock.getEntityAt(5)).not.toBe(null)
        })
    })
})
