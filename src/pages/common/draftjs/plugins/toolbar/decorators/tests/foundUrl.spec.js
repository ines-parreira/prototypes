//@flow
import { ContentState, RichUtils, SelectionState, EditorState } from 'draft-js'

import createFoundUrl from '../foundUrl'

const foundUrl = createFoundUrl()

describe('foundUrl decorator', () => {
    it('should select urls for decoration', () => {
        const text = 'find a url http://google.com and http://gorgias.io'
        const block = ContentState.createFromText(text).getBlockMap().first()
        const spy = jest.fn()
        foundUrl.strategy(block, spy)
        expect(spy.mock.calls.length).toBe(2)
        expect(spy.mock.calls[0]).toEqual([11, 28])
        expect(spy.mock.calls[1]).toEqual([33, 50])
    })

    it('should select url with {{variable}} in text', () => {
        const text = 'find a url http://google.com/{{ticket.id}}'
        const block = ContentState.createFromText(text).getBlockMap().first()
        const spy = jest.fn()
        foundUrl.strategy(block, spy)
        expect(spy.mock.calls.length).toBe(1)
        expect(spy.mock.calls[0]).toEqual([11, 42])
    })

    it('should not select urls that are entities', () => {
        const text = 'find a url http://google.com'
        let editorState = EditorState.createWithContent(ContentState.createFromText(text))
        const selection = SelectionState.createEmpty(editorState.getCurrentContent().getFirstBlock().getKey())
            .set('anchorOffset', 18)
            .set('focusOffset', 28)
        editorState.getCurrentContent().createEntity('link', 'MUTABLE')
        const entityKey = editorState.getCurrentContent().getLastCreatedEntityKey()
        editorState = RichUtils.toggleLink(editorState, selection, entityKey)

        const spy = jest.fn()
        foundUrl.strategy(editorState.getCurrentContent().getFirstBlock(), spy, editorState.getCurrentContent())
        expect(spy.mock.calls.length).toBe(0)
    })
})
