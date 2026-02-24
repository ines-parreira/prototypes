import type { ReactNode } from 'react'
import React from 'react'

import type { ContentBlock } from 'draft-js'
import {
    AtomicBlockUtils,
    CompositeDecorator,
    ContentState,
    EditorState,
    Modifier,
    SelectionState,
} from 'draft-js'
import { fromJS } from 'immutable'

import { setQuoteDepth } from '../../pages/common/draftjs/plugins/quotes/quotesEditorUtils'
import {
    containsMarkdownSyntax,
    ContentStateCounter,
    contentStateFromTextOrHTML,
    convertFromHTML,
    convertToHTML,
    createCollapsedSelectionState,
    EditorBlockType,
    editorStateWithReplacedText,
    findContentState,
    focusToTheEndOfContent,
    getContentStateBlocksSnapshot,
    getEntitySelectionState,
    getPlainText,
    getSelectedEntityKey,
    getSelectedText,
    insertNewBlockAtTheBeginning,
    insertNewBlockAtTheEnd,
    isValidSelectionKey,
    mergeContentStates,
    refreshEditor,
    removeMentions,
    selectWholeContentState,
    truncateContentStateBlocks,
    truncateContentStateWords,
    unescapeTemplateVars,
} from '../editor'

const imageContentState = ContentState.createFromBlockArray(
    AtomicBlockUtils.insertAtomicBlock(
        EditorState.createEmpty(),
        ContentState.createFromText('')
            .createEntity('img', 'IMMUTABLE', { src: '' })
            .getLastCreatedEntityKey(),
        ' ',
    )
        .getCurrentContent()
        .getBlocksAsArray()
        .slice(1),
)

describe('editor utils', () => {
    describe('convertToHTML', () => {
        it('should convert links (www.xxx.com) to html', () => {
            const text = 'Hello there\n\nwww.google.com'
            const contentState = ContentState.createFromText(text)
            expect(convertToHTML(contentState)).toMatchSnapshot()
        })

        it('should convert links (xxx.com) to html', () => {
            const text = 'Hello there\n\ngoogle.com'
            const contentState = ContentState.createFromText(text)
            expect(convertToHTML(contentState)).toMatchSnapshot()
        })

        it('should convert multiple links to html', () => {
            const text =
                'Hey There!\n\nwww.google.com\n\nAnother link: http://www.gorgias.com'
            const contentState = ContentState.createFromText(text)
            expect(convertToHTML(contentState)).toMatchSnapshot()
        })

        it('should NOT convert adjacent links to html correctly (www.xxx.comwww.yyy.com)', () => {
            const text =
                'Hey Marie Curie,\nmultiple links: www.facebook.comwww.github.com\n\nThanks for contacting us.'
            const contentState = ContentState.createFromText(text)
            expect(convertToHTML(contentState)).toMatchSnapshot()
        })

        it('should wrap images in inline-block figures', () => {
            const baseHTML =
                '<figure><img src="https://gorgias.io/" /></figure>'
            const contentState = convertFromHTML(baseHTML)
            expect(convertToHTML(contentState)).toMatchSnapshot()
        })

        // tests interaction between convertToHTML and convertFromHTML.
        it('should turn images into atomic blocks', () => {
            // create an editor state with an image
            const entityKey = ContentState.createFromText('')
                .createEntity('img', 'IMMUTABLE', { src: '' })
                .getLastCreatedEntityKey()
            const editorState = AtomicBlockUtils.insertAtomicBlock(
                EditorState.createEmpty(),
                entityKey,
                ' ',
            )
            // convert ContentState to plain html
            const wrappedHTML = convertToHTML(editorState.getCurrentContent())
            // convert resulted html back to ContentState
            const contentState = convertFromHTML(wrappedHTML)
            expect(
                contentState
                    .getBlocksAsArray()
                    .find(
                        (b) =>
                            (b as unknown as Record<string, unknown>).type ===
                            'atomic',
                    ),
            ).toBeTruthy()
        })

        it('should convert links with {{variables}} to html', () => {
            const text = 'Hello there\n\nwww.google.com/{{ticket.id}}'
            const contentState = ContentState.createFromText(text)
            expect(convertToHTML(contentState)).toMatchSnapshot()
        })

        it('should convert email addresses with target="_self"', () => {
            const text = 'Contact us at support@example.com'
            const contentState = ContentState.createFromText(text)
            const html = convertToHTML(contentState)
            expect(html).toContain('target="_self"')
            expect(html).toContain('mailto:support@example.com')
        })

        it('should convert URLs with target="_blank"', () => {
            const text = 'Visit www.example.com'
            const contentState = ContentState.createFromText(text)
            const html = convertToHTML(contentState)
            expect(html).toContain('target="_blank"')
            expect(html).toContain('http://www.example.com')
        })

        it('should turn newlines into br', () => {
            const text = 'One\nTwo\n\nThree\n\n\n'
            const contentState = ContentState.createFromText(text)
            expect(convertToHTML(contentState)).toMatchSnapshot()
        })

        it.each([
            [
                EditorBlockType.Unstyled,
                'div',
                ContentState.createFromText('unstyled'),
            ],
            [
                EditorBlockType.HeaderOne,
                'h1',
                convertFromHTML('<h1>header-one</h1>'),
            ],
            [
                EditorBlockType.HeaderTwo,
                'h2',
                convertFromHTML('<h2>header-two</h2>'),
            ],
            [
                EditorBlockType.HeaderThree,
                'h3',
                convertFromHTML('<h3>header-three</h3>'),
            ],
            [
                EditorBlockType.HeaderFour,
                'h4',
                convertFromHTML('<h4>header-four</h4>'),
            ],
            [
                EditorBlockType.HeaderFive,
                'h5',
                convertFromHTML('<h5>header-five</h5>'),
            ],
            [
                EditorBlockType.HeaderSix,
                'h6',
                convertFromHTML('<h6>header-six</h6>'),
            ],
            [
                EditorBlockType.Blockquote,
                'blockquote',
                convertFromHTML('<blockquote>blockquote</blockquote>'),
            ],
            [
                EditorBlockType.CodeBlock,
                'pre',
                convertFromHTML('<pre>code-block</pre>'),
            ],
            [EditorBlockType.Atomic, 'img', imageContentState],
            [
                EditorBlockType.UnorderedListItem,
                'ul',
                convertFromHTML('<ul><li>unordered-list-item</li>'),
            ],
            [
                EditorBlockType.OrderedListItem,
                'ol',
                convertFromHTML('<ol><li>ordered-list-item</li>'),
            ],
        ])('should convert "%s" to "%s"', (from, to, contentState) => {
            const quotedContentState = setQuoteDepth(
                contentState,
                selectWholeContentState(contentState),
                1,
            )
            expect(convertToHTML(quotedContentState)).toMatchSnapshot()
        })
        it('should convert ordered list items with depth-based ol types', () => {
            const html =
                '<ol><li>depth 0</li><ol><li>depth 1</li><ol><li>depth 2</li><ol><li>depth 3</li></ol></ol></ol></ol>'
            const contentState = convertFromHTML(html)
            const result = convertToHTML(contentState)
            expect(result).toContain('<ol type="1">')
            expect(result).toContain('<ol type="a">')
            expect(result).toContain('<ol type="i">')
        })

        it('should convert video entity to html', () => {
            let contentState = ContentState.createFromText('')
            contentState = contentState.createEntity('video', 'MUTABLE', {
                url: 'https://www.youtube.com/watch?v=test',
                width: 500,
            })
            const entityKey = contentState.getLastCreatedEntityKey()
            const editorState = AtomicBlockUtils.insertAtomicBlock(
                EditorState.createEmpty(),
                entityKey,
                ' ',
            )
            const html = convertToHTML(editorState.getCurrentContent())
            expect(html).toContain('gorgias-video-container')
            expect(html).toContain(
                'data-video-src="https://www.youtube.com/watch?v=test"',
            )
            expect(html).toContain('width="500"')
        })

        it('should convert discount code link entity to html', () => {
            let contentState = ContentState.createFromText('')
            contentState = contentState.createEntity(
                'discount-code-link',
                'IMMUTABLE',
                {
                    url: 'https://shop.com/discount',
                    code: 'SAVE10',
                },
            )
            const entityKey = contentState.getLastCreatedEntityKey()
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 0)
                .set('focusOffset', 0) as SelectionState
            contentState = Modifier.insertText(
                contentState,
                selection,
                'SAVE10',
                undefined,
                entityKey,
            )
            const html = convertToHTML(contentState)
            expect(html).toContain('data-discount-code="SAVE10"')
            expect(html).toContain('href="https://shop.com/discount"')
        })
    })

    describe('from HTML', () => {
        it('should ONLY unescape template variables', () => {
            const baseHTML =
                '<div><a href="http://{{ticket.account.domain}}.gorgias.io/app/ticket/{{ticket.id}}/hel%7B%7Bhello%7D%7D" target="_blank">link</a></div>'
            const contentState = convertFromHTML(baseHTML)
            const newHTML = convertToHTML(contentState)
            expect(newHTML).toEqual(baseHTML)
        })

        it('should convert image to img entity', () => {
            const baseHTML = '<img src="https://gorgias.io/">'
            const contentState = convertFromHTML(baseHTML)
            const entityKey = contentState.getFirstBlock().getEntityAt(0)
            expect(contentState.getEntity(entityKey).getType()).toEqual('img')
        })

        it('should convert image to img entity with data', () => {
            const baseHTML = '<img src="https://gorgias.io/">'
            const contentState = convertFromHTML(baseHTML)
            const entityKey = contentState.getFirstBlock().getEntityAt(0)
            expect(contentState.getEntity(entityKey).getData()).toEqual({
                src: 'https://gorgias.io/',
                width: 400,
            })
        })

        it('should not add a newline at the end of an unstyled block', () => {
            const baseHTML = '<div>A<br></div>B'
            const contentState = convertFromHTML(baseHTML)
            expect(contentState.getFirstBlock().get('text')).toEqual('A')
        })

        it('should maintain multiple newlines at the end of a block', () => {
            const baseHTML = '<div>A<br><br><br /></div>B'
            const contentState = convertFromHTML(baseHTML)
            expect(contentState.getFirstBlock().get('text')).toEqual('A\n\n')
        })

        it('should maintain newlines outside blocks', () => {
            const baseHTML = '<div>A</div><br><br />B'
            const contentState = convertFromHTML(baseHTML)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks[0].get('text')).toEqual('A')
            expect(blocks[1].get('text')).toEqual('')
            expect(blocks[2].get('text')).toEqual('')
            expect(blocks[3].get('text')).toEqual('B')
        })

        it('should remove newlines from newline-only blocks', () => {
            const baseHTML = 'A<div><br></div>B'
            const contentState = convertFromHTML(baseHTML)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks[0].get('text')).toEqual('A')
            expect(blocks[1].get('text')).toEqual('')
            expect(blocks[2].get('text')).toEqual('B')
        })

        it.each([
            ['div', EditorBlockType.Unstyled, '<div>Foo</div>'],
            ['p', EditorBlockType.Unstyled, '<p>Foo</p>'],
            ['h1', EditorBlockType.HeaderOne, '<h1>Header 1</h1>'],
            ['h2', EditorBlockType.HeaderTwo, '<h2>Header 2</h2>'],
            ['h3', EditorBlockType.HeaderThree, '<h3>Header 3</h3>'],
            ['h4', EditorBlockType.HeaderFour, '<h4>Header 4</h4>'],
            ['h5', EditorBlockType.HeaderFive, '<h5>Header 5</h5>'],
            ['h6', EditorBlockType.HeaderSix, '<h6>Header 6</h6>'],
            [
                'ol',
                EditorBlockType.OrderedListItem,
                '<ol><li>Ordered list</li></ol>',
            ],
            [
                'ul',
                EditorBlockType.UnorderedListItem,
                '<ol><li>Unordered list</li></ol>',
            ],
            ['pre', EditorBlockType.CodeBlock, '<pre>Code block</pre>'],
            [
                'blockquote',
                EditorBlockType.Blockquote,
                '<blockquote>Blockquote</blockquote>',
            ],
            ['figure', EditorBlockType.Atomic, '<figure>Figure</figure>'],
        ])('convert quoted "%s" to "%s" block', (from, to, htmlToQuote) => {
            const contentState = convertFromHTML(htmlToQuote)
            const quotedContentState = setQuoteDepth(
                contentState,
                selectWholeContentState(contentState),
                3,
            )
            const quotedHtml = convertToHTML(quotedContentState)
            const resultContentState = convertFromHTML(quotedHtml)
            expect(
                getContentStateBlocksSnapshot(resultContentState),
            ).toMatchSnapshot()
        })

        it('should convert empty figure to an empty atomic block', () => {
            const contentState = convertFromHTML('<figure />')
            expect(
                getContentStateBlocksSnapshot(contentState),
            ).toMatchSnapshot()
        })

        it('should roundtrip video entity through convertToHTML and convertFromHTML', () => {
            let contentState = ContentState.createFromText('')
            contentState = contentState.createEntity('video', 'MUTABLE', {
                url: 'https://www.youtube.com/watch?v=test',
                width: 500,
            })
            const entityKey = contentState.getLastCreatedEntityKey()
            const editorState = AtomicBlockUtils.insertAtomicBlock(
                EditorState.createEmpty(),
                entityKey,
                ' ',
            )
            const html = convertToHTML(editorState.getCurrentContent())
            const restored = convertFromHTML(html)
            const blocks = restored.getBlocksAsArray()
            const atomicBlock = blocks.find((b) => b.getType() === 'atomic')
            expect(atomicBlock).toBeTruthy()
            const restoredEntityKey = atomicBlock!.getEntityAt(0)
            expect(restoredEntityKey).toBeTruthy()
            const entity = restored.getEntity(restoredEntityKey)
            expect(entity.getType()).toEqual('video')
            expect(entity.getData().url).toEqual(
                'https://www.youtube.com/watch?v=test',
            )
        })

        it('should convert discount code link from html', () => {
            const baseHTML =
                '<a data-discount-code="SAVE10" href="https://shop.com/discount" target="_blank" rel="noreferrer">SAVE10</a>'
            const contentState = convertFromHTML(baseHTML)
            const block = contentState.getFirstBlock()
            const entityKey = block.getEntityAt(0)
            expect(entityKey).toBeTruthy()
            const entity = contentState.getEntity(entityKey)
            expect(entity.getType()).toEqual('discount-code-link')
            expect(entity.getData()).toEqual({
                url: 'https://shop.com/discount',
                code: 'SAVE10',
            })
        })

        it('should convert hr to horizontal rule entity', () => {
            const baseHTML = '<div>Above</div><hr /><div>Below</div>'
            const contentState = convertFromHTML(baseHTML)
            const blocks = contentState.getBlocksAsArray()
            const hrBlock = blocks.find((b) => b.getType() === 'atomic')
            expect(hrBlock).toBeTruthy()
        })

        it('should use data-templated-url & target', () => {
            const baseHTML =
                '<div><a href="{{ticket.url}}" target="_self" data-templated-url="{{ticket.url}}">link</a></div>'
            const contentState = convertFromHTML(baseHTML)
            const newHTML = convertToHTML(contentState)
            expect(newHTML).toEqual(baseHTML)
        })

        it('should unwrap <p> inside <li> for unordered lists', () => {
            const html = '<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>'
            const contentState = convertFromHTML(html)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks).toHaveLength(2)
            expect(blocks[0].getType()).toBe(EditorBlockType.UnorderedListItem)
            expect(blocks[0].getText()).toBe('Item 1')
            expect(blocks[1].getType()).toBe(EditorBlockType.UnorderedListItem)
            expect(blocks[1].getText()).toBe('Item 2')
        })

        it('should unwrap <p> inside <li> for ordered lists', () => {
            const html = '<ol><li><p>First</p></li><li><p>Second</p></li></ol>'
            const contentState = convertFromHTML(html)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks).toHaveLength(2)
            expect(blocks[0].getType()).toBe(EditorBlockType.OrderedListItem)
            expect(blocks[0].getText()).toBe('First')
            expect(blocks[1].getType()).toBe(EditorBlockType.OrderedListItem)
            expect(blocks[1].getText()).toBe('Second')
        })

        it('should preserve inline formatting when unwrapping <p> inside <li>', () => {
            const html =
                '<ul><li><p><strong>Bold</strong> and <em>italic</em></p></li></ul>'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            expect(block.getType()).toBe(EditorBlockType.UnorderedListItem)
            expect(block.getText()).toBe('Bold and italic')
            expect(block.getInlineStyleAt(0).has('BOLD')).toBe(true)
            expect(block.getInlineStyleAt(10).has('ITALIC')).toBe(true)
        })

        it('should not affect standalone <p> tags outside lists', () => {
            const html = '<p>Paragraph</p><ul><li><p>Item</p></li></ul>'
            const contentState = convertFromHTML(html)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks[0].getType()).toBe(EditorBlockType.Unstyled)
            expect(blocks[0].getText()).toBe('Paragraph')
            expect(blocks[1].getType()).toBe(EditorBlockType.UnorderedListItem)
            expect(blocks[1].getText()).toBe('Item')
        })

        it('should flatten nested UL inside LI without creating unstyled blocks', () => {
            const html = '<ul><li>A<ul><li>B</li></ul></li><li>C</li></ul>'
            const contentState = convertFromHTML(html)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks).toHaveLength(3)
            expect(blocks[0].getType()).toBe(EditorBlockType.UnorderedListItem)
            expect(blocks[0].getText()).toBe('A')
            expect(blocks[0].getDepth()).toBe(0)
            expect(blocks[1].getType()).toBe(EditorBlockType.UnorderedListItem)
            expect(blocks[1].getText()).toBe('B')
            expect(blocks[1].getDepth()).toBe(1)
            expect(blocks[2].getType()).toBe(EditorBlockType.UnorderedListItem)
            expect(blocks[2].getText()).toBe('C')
            expect(blocks[2].getDepth()).toBe(0)
        })

        it('should flatten nested OL inside LI without creating unstyled blocks', () => {
            const html =
                '<ol><li>First<ol><li>Second</li></ol></li><li>Third</li></ol>'
            const contentState = convertFromHTML(html)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks).toHaveLength(3)
            expect(blocks[0].getType()).toBe(EditorBlockType.OrderedListItem)
            expect(blocks[0].getText()).toBe('First')
            expect(blocks[0].getDepth()).toBe(0)
            expect(blocks[1].getType()).toBe(EditorBlockType.OrderedListItem)
            expect(blocks[1].getText()).toBe('Second')
            expect(blocks[1].getDepth()).toBe(1)
            expect(blocks[2].getType()).toBe(EditorBlockType.OrderedListItem)
            expect(blocks[2].getText()).toBe('Third')
            expect(blocks[2].getDepth()).toBe(0)
        })

        it('should flatten deeply nested lists (3 levels) without creating unstyled blocks', () => {
            const html =
                '<ul><li>L0<ul><li>L1<ul><li>L2</li></ul></li></ul></li><li>Back to L0</li></ul>'
            const contentState = convertFromHTML(html)
            const blocks = contentState.getBlocksAsArray()
            expect(blocks).toHaveLength(4)
            expect(
                blocks.every(
                    (b) => b.getType() === EditorBlockType.UnorderedListItem,
                ),
            ).toBe(true)
            expect(blocks[0].getText()).toBe('L0')
            expect(blocks[0].getDepth()).toBe(0)
            expect(blocks[1].getText()).toBe('L1')
            expect(blocks[1].getDepth()).toBe(1)
            expect(blocks[2].getText()).toBe('L2')
            expect(blocks[2].getDepth()).toBe(2)
            expect(blocks[3].getText()).toBe('Back to L0')
            expect(blocks[3].getDepth()).toBe(0)
        })
    })

    describe('unescape template variables', () => {
        it('should ONLY unescape template variables', () => {
            expect(
                unescapeTemplateVars(
                    '%7Bh%7B%7Bello%7D%7D %7B%7Bticket.customer.email%7D%7D %7B%7Bmessage.from_agent%7D%7D %7B%7Bevent.type%7D%7D',
                ),
            ).toEqual(
                '%7Bh%7B%7Bello%7D%7D {{ticket.customer.email}} {{message.from_agent}} {{event.type}}',
            )
        })

        it('should NOT unescape variables (invalid template variables)', () => {
            expect(
                unescapeTemplateVars('hello %7B%7Baccount.id%7D%7D'),
            ).toEqual('hello %7B%7Baccount.id%7D%7D')
            expect(
                unescapeTemplateVars(
                    'hello %7B%7Bintegrations.data%7D%7D 7B%hello 7B%7B%hello7%D7%D',
                ),
            ).toEqual(
                'hello %7B%7Bintegrations.data%7D%7D 7B%hello 7B%7B%hello7%D7%D',
            )
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

        it('should preserve line breaks from <br> tags inside paragraphs', () => {
            // marked.parse with breaks: true produces <br> for \n in paragraphs.
            // This verifies that those <br> tags are preserved as \n in block text,
            // fixing line break loss when pasting text containing ordered list syntax.
            const html = '<p>First line<br>Second line</p>'
            const contentState = contentStateFromTextOrHTML('any text', html)
            const block = contentState.getFirstBlock()
            expect(block.getText()).toBe('First line\nSecond line')
        })
    })

    describe('editorStateWithReplacedText', () => {
        it('should replace the text in editor state', () => {
            const oldEditorState = EditorState.createWithContent(
                ContentState.createFromText('old text'),
            )

            const text = 'new text'
            const newEditorState = editorStateWithReplacedText(
                oldEditorState,
                text,
            )
            expect(newEditorState.getCurrentContent().getPlainText()).toBe(text)
        })
    })

    describe('getSelectedText()', () => {
        it('should return selected text', () => {
            const text =
                'Elit culpa tempor enim sunt pariatur do deserunt adipisicing nisi.'
            const contentState = ContentState.createFromText(text)
            const block = contentState.getFirstBlock()
            const [start, end] = [3, 14]
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', start)
                .set('focusOffset', end) as SelectionState
            const selectedText = getSelectedText(contentState, selection)
            expect(selectedText).toBe(text.slice(start, end))
        })

        it('should return empty string if selection is collapsed', () => {
            const text =
                'Elit culpa tempor enim sunt pariatur do deserunt adipisicing nisi.'
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
            const selection = SelectionState.createEmpty(block.getKey()).set(
                'focusOffset',
                3,
            ) as SelectionState
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return entity key when part of the entity is selected', () => {
            const html = '<a href="http://google.com">link</a>'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 1)
                .set('focusOffset', 2) as SelectionState
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
                .set('focusOffset', 4) as SelectionState
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBe(block.getEntityAt(0))
        })

        it('should return falsy value when cursor is outside the entity', () => {
            const html = '<a href="http://google.com">link</a> '
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 5)
                .set('focusOffset', 5) as SelectionState
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })

        it('should return falsy value when more than the entity is selected', () => {
            const html = 'foo <a href="http://google.com">link</a> bar'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).set(
                'focusOffset',
                9,
            ) as SelectionState
            const entityKey = getSelectedEntityKey(contentState, selection)
            expect(entityKey).toBeFalsy()
        })
    })

    describe('removeMentions', () => {
        it('should remove only mentions', () => {
            let contentState = convertFromHTML(
                '@Foo <a href="http://gorgias.io">Gorgias</a>',
            )
            contentState = contentState.createEntity('mention', 'SEGMENTED')
            const entityKey = contentState.getLastCreatedEntityKey()
            const selection = SelectionState.createEmpty(
                contentState.getFirstBlock().getKey(),
            ).set('focusOffset', 4) as SelectionState
            contentState = Modifier.replaceText(
                contentState,
                selection,
                '@Foo',
                null as any, // no inline style needed
                entityKey,
            )
            const editorState = EditorState.createWithContent(contentState)
            const newEditorState = removeMentions(editorState)
            const newBlock = newEditorState.getCurrentContent().getFirstBlock()
            expect(newBlock.getEntityAt(0)).toBe(null)
            expect(newBlock.getEntityAt(5)).not.toBe(null)
        })
    })

    describe('refreshEditor', () => {
        it('should create a copy that doesnt pass the equality check', () => {
            const contentState = ContentState.createFromText('foo bar baz')
            const decorators = new CompositeDecorator([
                {
                    strategy: (contentBlock: ContentBlock, callback) =>
                        callback(0, 1),
                    component: (props: { children: ReactNode }) => (
                        <span>{props.children}</span>
                    ),
                },
            ])
            let editorState = EditorState.createWithContent(
                contentState,
                decorators,
            )
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
            const newEditorState = refreshEditor(editorState)
            expect(newEditorState).not.toBe(editorState)
            const oldSel = editorState.getSelection()
            const newSel = newEditorState.getSelection()
            expect(newSel.getAnchorKey()).toBe(oldSel.getAnchorKey())
            expect(newSel.getAnchorOffset()).toBe(oldSel.getAnchorOffset())
            expect(newSel.getFocusKey()).toBe(oldSel.getFocusKey())
            expect(newSel.getFocusOffset()).toBe(oldSel.getFocusOffset())
            expect(newSel.getHasFocus()).toBe(oldSel.getHasFocus())
            expect(newEditorState.getCurrentContent()).toBe(
                editorState.getCurrentContent(),
            )
            expect(newEditorState.getDecorator()).toBe(decorators)
            expect(newEditorState.getRedoStack()).toBe(
                editorState.getRedoStack(),
            )
            expect(newEditorState.getUndoStack()).toBe(
                editorState.getUndoStack(),
            )
            expect(newEditorState.getLastChangeType()).toBe(
                editorState.getLastChangeType(),
            )
        })
    })

    describe('isValidSelectionKey', () => {
        const editorState1 = EditorState.createWithContent(
            ContentState.createFromText('foo'),
        )
        const editorState2 = EditorState.createWithContent(
            ContentState.createFromText('bar'),
        )

        it('should return true for selection from the same editorState', () => {
            expect(
                isValidSelectionKey(editorState1, editorState1.getSelection()),
            ).toBe(true)
        })

        it('should return false for selection from some other editorState', () => {
            expect(
                isValidSelectionKey(editorState1, editorState2.getSelection()),
            ).toBe(false)
        })

        it('should return false if anchor key is valid but focus key is not', () => {
            const selection = editorState1
                .getSelection()
                .set('focusKey', 'blabla') as SelectionState
            expect(isValidSelectionKey(editorState1, selection)).toBe(false)
        })

        it('should return false for selection not updated after pushing new state', () => {
            const contentState = ContentState.createFromText('baz')
            //@ts-ignore EditorState.push should have 3 args
            const newEditorState = EditorState.push(editorState1, contentState)
            expect(
                isValidSelectionKey(
                    newEditorState,
                    editorState1.getSelection(),
                ),
            ).toBe(false)
        })
    })

    describe('getPlainText()', () => {
        it('should return link url in plaintext', () => {
            const html = '<a href="http://gorgias.io">link</a>'
            const contentState = convertFromHTML(html)
            expect(getPlainText(contentState)).toBe('link: http://gorgias.io/')
        })

        it('should return link url in mixed plaintext', () => {
            const html = 'One <a href="http://gorgias.io">gorgias</a> link'
            const contentState = convertFromHTML(html)
            expect(getPlainText(contentState)).toBe(
                'One gorgias: http://gorgias.io/ link',
            )
        })

        it('should return link urls for multiple same-line entities', () => {
            const html =
                '' +
                'One <a href="http://gorgias.io">gorgias</a>' +
                ' link <a href="https://gorgias.io/features">home</a> and back'
            const contentState = convertFromHTML(html)
            expect(getPlainText(contentState)).toBe(
                'One gorgias: http://gorgias.io/ link home: https://gorgias.io/features and back',
            )
        })

        it('should return link url in multiline plaintext', () => {
            const html =
                '' +
                'First line<br>' +
                'One <a href="http://gorgias.io">gorgias</a> link<br>' +
                'Last line'
            const contentState = convertFromHTML(html)
            expect(getPlainText(contentState)).toBe(
                'First line\nOne gorgias: http://gorgias.io/ link\nLast line',
            )
        })

        it('should omit the link content if it is the same as the link url ', () => {
            const html =
                'One <a href="http://gorgias.io">gorgias</a> and <a href="http://google.com/">http://google.com/</a> end.'
            const contentState = convertFromHTML(html)
            expect(getPlainText(contentState)).toBe(
                'One gorgias: http://gorgias.io/ and http://google.com/ end.',
            )
        })

        it('should ignore the url link ending slash', () => {
            const html =
                'a <a href="http://gorgias.io/">http://gorgias.io</a> b.'
            const contentState = convertFromHTML(html)
            expect(getPlainText(contentState)).toBe('a http://gorgias.io b.')
        })

        it('should return regular getPlainText in strings with unicode chars', () => {
            const html = '👀<a href="http://gorgias.io">link</a>'
            const contentState = convertFromHTML(html)
            expect(getPlainText(contentState)).toBe('👀link')
        })

        it('should add ">" to the quoted content', () => {
            const contentState = [
                ContentState.createFromText('Quoted text'),
                ContentState.createFromText(''),
                ContentState.createFromText('More quoted text'),
            ].reduce((contentState, line, i) => {
                return mergeContentStates(
                    contentState,
                    setQuoteDepth(line, selectWholeContentState(line), i + 1),
                )
            }, ContentState.createFromText('No quote'))

            expect(getPlainText(contentState)).toMatchSnapshot()
        })
    })

    describe('insertNewBlockAtTheEnd', () => {
        it('should insert a new empty block at the end of the content', () => {
            const contentState = ContentState.createFromText('Foo')
            const newContentState = insertNewBlockAtTheEnd(contentState)
            expect(
                getContentStateBlocksSnapshot(newContentState),
            ).toMatchSnapshot()
        })
    })

    describe('insertNewBlockAtTheBeginning', () => {
        it('should insert a new empty block at the beginning of the content', () => {
            const contentState = ContentState.createFromText('Foo')
            const newContentState = insertNewBlockAtTheBeginning(contentState)
            expect(
                getContentStateBlocksSnapshot(newContentState),
            ).toMatchSnapshot()
        })
    })

    describe('findContentState', () => {
        it('should return null when state was not found', () => {
            const parentContentState = ContentState.createFromText('Foo')
            const contentState = ContentState.createFromText('Bar')
            expect(findContentState(parentContentState, contentState)).toBe(
                null,
            )
        })

        it('should return the selection state of the found fragment', () => {
            const parentContentState =
                ContentState.createFromText('Foo\n\n\nBar\nBaz')
            const contentState = ContentState.createFromText('\n\nBar')
            const selectionState = findContentState(
                parentContentState,
                contentState,
            )
            expect(selectionState).not.toBe(null)
            const removedSelectionContentState = Modifier.removeRange(
                parentContentState,
                selectionState as SelectionState,
                'forward',
            )
            expect(removedSelectionContentState.getPlainText()).toBe(
                'Foo\n\nBaz',
            )
        })

        it('should return null when fragment matches partially', () => {
            const parentContentState =
                ContentState.createFromText('Foo\n\n\nBarBaz')
            const contentState = ContentState.createFromText('\n\nBar')
            expect(findContentState(parentContentState, contentState)).toBe(
                null,
            )
        })

        it('should return null when text matches but the data is different', () => {
            const parentContentState = (() => {
                const contentState = ContentState.createFromText('Foo\nBar')
                const selectionState = SelectionState.createEmpty(
                    contentState.getFirstBlock().getKey(),
                )
                    .set('focusKey', contentState.getLastBlock().getKey())
                    .set('focusOffset', contentState.getLastBlock().getLength())
                return Modifier.setBlockData(
                    contentState,
                    selectionState as SelectionState,
                    fromJS({ foo: 'bar' }),
                )
            })()
            const contentState = ContentState.createFromText('Bar')
            expect(findContentState(parentContentState, contentState)).toBe(
                null,
            )
        })

        it('should return the selection state of the full match when both partial and full matches are in the parent content state', () => {
            const parentContentState = ContentState.createFromText(
                'Foo\nBar\nFoo\nBar\nBaz',
            )
            const contentState = ContentState.createFromText('Bar\nBaz')
            const selectionState = findContentState(
                parentContentState,
                contentState,
            )
            expect(selectionState).not.toBe(null)
            const removedSelectionContentState = Modifier.removeRange(
                parentContentState,
                selectionState as SelectionState,
                'forward',
            )
            expect(removedSelectionContentState.getPlainText()).toBe(
                'Foo\nBar\nFoo\n',
            )
        })
    })

    describe('createCollapsedSelectionState', () => {
        it('should create a collapsed selection state', () => {
            const selection = createCollapsedSelectionState('foo', 2)
            expect(selection.isCollapsed()).toBe(true)
            expect(selection.getAnchorKey()).toBe('foo')
            expect(selection.getAnchorOffset()).toBe(2)
            expect(selection.getFocusKey()).toBe(selection.getAnchorKey())
            expect(selection.getFocusOffset()).toBe(selection.getAnchorOffset())
        })
    })

    describe('selectWholeContentState', () => {
        it('should return the selection state that selects all content', () => {
            const contentState = ContentState.createFromText('Foo\nBarBaz')
            const selection = selectWholeContentState(contentState)
            expect(selection.getAnchorKey()).toBe(
                contentState.getFirstBlock().getKey(),
            )
            expect(selection.getAnchorOffset()).toBe(0)
            expect(selection.getFocusKey()).toBe(
                contentState.getLastBlock().getKey(),
            )
            expect(selection.getFocusOffset()).toBe(
                contentState.getLastBlock().getLength(),
            )
        })
    })

    describe('mergeContentStates', () => {
        it('should add content state at the end of the original content state', () => {
            const contentState = mergeContentStates(
                ContentState.createFromText('Foo\nBar'),
                ContentState.createFromText('Baz'),
            )
            expect(
                getContentStateBlocksSnapshot(contentState),
            ).toMatchSnapshot()
        })
    })

    describe('truncateContentStateBlocks', () => {
        it('should throw an error if n is negative', () => {
            expect(() => {
                truncateContentStateBlocks(
                    ContentState.createFromText('Foo bar'),
                    -1,
                )
            }).toThrow('Negative number of blocks')
        })

        it('should return empty contentState if n is equal 0', () => {
            const contentState = ContentState.createFromText('Foo bar')
            expect(
                truncateContentStateBlocks(contentState, 0).getBlocksAsArray(),
            ).toEqual([])
        })

        it('should truncate blocks', () => {
            const contentState = ContentState.createFromText('Foo\nBar\nBaz')
            const truncatedContentState = truncateContentStateBlocks(
                contentState,
                2,
            )
            expect(
                getContentStateBlocksSnapshot(truncatedContentState),
            ).toMatchSnapshot()
        })

        it('should return the same content state when n is larger or equal the number of blocks in the content state', () => {
            const contentState = ContentState.createFromText('Foo\nBar\nBaz')
            expect(truncateContentStateBlocks(contentState, 3)).toBe(
                contentState,
            )
            expect(truncateContentStateBlocks(contentState, 4)).toBe(
                contentState,
            )
        })
    })

    describe('truncateContentStateWords', () => {
        it('should throw an error if n is negative', () => {
            expect(() => {
                truncateContentStateWords(
                    ContentState.createFromText('Foo bar'),
                    -1,
                )
            }).toThrow('Negative number of words')
        })

        it('should return an empty content state if n is equal 0', () => {
            expect(
                truncateContentStateWords(
                    ContentState.createFromText('Foo'),
                    0,
                ).getPlainText(),
            ).toBe('')
        })

        it('should truncate content state words', () => {
            const contentState = ContentState.createFromText(
                'Foo bar\n Baz  Bac\nQux quux',
            )
            const truncatedContentState = truncateContentStateWords(
                contentState,
                5,
            )
            expect(
                getContentStateBlocksSnapshot(truncatedContentState),
            ).toMatchSnapshot()
        })

        it('should return the same content state if it was not truncated', () => {
            const contentState = ContentState.createFromText('Foo\nBar\nBaz')
            expect(truncateContentStateWords(contentState, 3)).toBe(
                contentState,
            )
            expect(truncateContentStateWords(contentState, 4)).toBe(
                contentState,
            )
        })
    })

    describe('ContentStateCounter', () => {
        it('should construct an empty counter', () => {
            const counter = new ContentStateCounter()
            expect(counter.words).toBe(0)
            expect(counter.blocks).toBe(0)
        })

        it('should construct a counter from content state', () => {
            const contentState = ContentState.createFromText('Foo Bar\nBaz')
            const counter = new ContentStateCounter(contentState)
            expect(counter.words).toBe(3)
            expect(counter.blocks).toBe(2)
        })

        it('should add a content state', () => {
            const counter = new ContentStateCounter(
                ContentState.createFromText('Foo Bar\nBaz'),
            )
            counter.addContentState(ContentState.createFromText('Bac'))
            expect(counter.words).toBe(4)
            expect(counter.blocks).toBe(3)
        })

        it('should remove a content state', () => {
            const counter = new ContentStateCounter(
                ContentState.createFromText('Foo Bar\nBaz'),
            )
            counter.removeContentState(ContentState.createFromText('Baz'))
            expect(counter.words).toBe(2)
            expect(counter.blocks).toBe(1)
        })

        it('should reset a content state', () => {
            const counter = new ContentStateCounter(
                ContentState.createFromText('Foo Bar\nBaz'),
            )
            counter.reset(ContentState.createFromText('Baz'))
            expect(counter.words).toBe(1)
            expect(counter.blocks).toBe(1)
        })
    })

    describe('getEntitySelectionState', () => {
        it('should find entity selection in a single block', () => {
            let contentState = ContentState.createFromText('Hello world')
            contentState = contentState.createEntity('LINK', 'MUTABLE', {
                url: 'https://example.com',
            })
            const entityKey = contentState.getLastCreatedEntityKey()

            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey())
                .set('anchorOffset', 6)
                .set('focusOffset', 11) as SelectionState

            contentState = Modifier.applyEntity(
                contentState,
                selection,
                entityKey,
            )

            const result = getEntitySelectionState(contentState, entityKey)
            expect(result).toBeDefined()
            expect(result!.getAnchorOffset()).toBe(6)
            expect(result!.getFocusOffset()).toBe(11)
            expect(result!.getAnchorKey()).toBe(block.getKey())
        })

        it('should return undefined when entity key does not exist', () => {
            const contentState = ContentState.createFromText('Hello world')
            const result = getEntitySelectionState(
                contentState,
                'nonexistent-key',
            )
            expect(result).toBeUndefined()
        })

        it('should find entity in second block', () => {
            let contentState = ContentState.createFromText('First\nSecond')
            contentState = contentState.createEntity('LINK', 'MUTABLE', {
                url: 'https://example.com',
            })
            const entityKey = contentState.getLastCreatedEntityKey()

            const blocks = contentState.getBlocksAsArray()
            const secondBlock = blocks[1]
            const selection = SelectionState.createEmpty(secondBlock.getKey())
                .set('anchorOffset', 0)
                .set('focusOffset', 6) as SelectionState

            contentState = Modifier.applyEntity(
                contentState,
                selection,
                entityKey,
            )

            const result = getEntitySelectionState(contentState, entityKey)
            expect(result).toBeDefined()
            expect(result!.getAnchorKey()).toBe(secondBlock.getKey())
            expect(result!.getAnchorOffset()).toBe(0)
            expect(result!.getFocusOffset()).toBe(6)
        })
    })

    describe('focusToTheEndOfContent', () => {
        it('should move selection to end of last block', () => {
            const editorState = EditorState.createWithContent(
                ContentState.createFromText('Hello'),
            )
            const result = focusToTheEndOfContent(editorState)
            const selection = result.getSelection()

            const block = result.getCurrentContent().getLastBlock()
            expect(selection.getAnchorKey()).toBe(block.getKey())
            expect(selection.getAnchorOffset()).toBe(5)
            expect(selection.getFocusKey()).toBe(block.getKey())
            expect(selection.getFocusOffset()).toBe(5)
        })

        it('should move selection to end of last block with multi-block content', () => {
            const editorState = EditorState.createWithContent(
                ContentState.createFromText('First\nSecond\nThird'),
            )
            const result = focusToTheEndOfContent(editorState)
            const selection = result.getSelection()

            const lastBlock = result.getCurrentContent().getLastBlock()
            expect(selection.getAnchorKey()).toBe(lastBlock.getKey())
            expect(selection.getAnchorOffset()).toBe(5) // "Third".length
            expect(selection.getFocusKey()).toBe(lastBlock.getKey())
            expect(selection.getFocusOffset()).toBe(5)
        })
    })

    describe('containsMarkdownSyntax', () => {
        it('should return false for plain text', () => {
            expect(containsMarkdownSyntax('just some plain text')).toBe(false)
            expect(containsMarkdownSyntax('Line 1\nLine 2\nLine 3')).toBe(false)
        })

        it('should return false for empty or whitespace-only text', () => {
            expect(containsMarkdownSyntax('')).toBe(false)
            expect(containsMarkdownSyntax('   ')).toBe(false)
        })

        it('should detect headers', () => {
            expect(containsMarkdownSyntax('# Heading 1')).toBe(true)
            expect(containsMarkdownSyntax('## Heading 2')).toBe(true)
        })

        it('should detect bold text', () => {
            expect(containsMarkdownSyntax('**bold text**')).toBe(true)
            expect(containsMarkdownSyntax('__bold text__')).toBe(true)
        })

        it('should detect lists', () => {
            expect(containsMarkdownSyntax('* Item 1')).toBe(true)
            expect(containsMarkdownSyntax('1. First item')).toBe(true)
        })

        it('should detect links', () => {
            expect(containsMarkdownSyntax('[link](http://example.com)')).toBe(
                true,
            )
        })

        it('should NOT detect false positives', () => {
            expect(containsMarkdownSyntax('Price is $10 * quantity')).toBe(
                false,
            )
            expect(containsMarkdownSyntax('Use #hashtag for social')).toBe(
                false,
            )
        })
    })
})
