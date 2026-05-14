import type { MessageFormState } from 'AIJourney/types/RcsTestSend'

import {
    BUTTON_TYPES,
    INITIAL_FORM,
    messageFormReducer,
    stripHtml,
} from './reducer'

const baseState: MessageFormState = {
    contextText: '',
    contextTitle: '',
    image: '',
    buttons: [],
    productEntries: [],
}

describe('BUTTON_TYPES', () => {
    it('contains QUICK_REPLY and URL entries', () => {
        expect(BUTTON_TYPES).toEqual([
            { id: 'QUICK_REPLY', label: 'Quick reply' },
            { id: 'URL', label: 'URL' },
        ])
    })
})

describe('INITIAL_FORM', () => {
    it('has empty default values', () => {
        expect(INITIAL_FORM).toEqual({
            contextText: '',
            contextTitle: '',
            image: '',
            buttons: [],
            productEntries: [],
        })
    })
})

describe('stripHtml', () => {
    it('removes a simple tag', () => {
        expect(stripHtml('<p>hello</p>')).toBe('hello')
    })

    it('removes nested tags', () => {
        expect(stripHtml('<div><strong>bold</strong> text</div>')).toBe(
            'bold text',
        )
    })

    it('strips self-closing tags', () => {
        expect(stripHtml('line1<br/>line2')).toBe('line1line2')
    })

    it('trims leading and trailing whitespace', () => {
        expect(stripHtml('  <p>  trimmed  </p>  ')).toBe('trimmed')
    })

    it('returns plain text unchanged', () => {
        expect(stripHtml('no tags here')).toBe('no tags here')
    })

    it('returns empty string for empty input', () => {
        expect(stripHtml('')).toBe('')
    })

    it('returns empty string for tag-only input', () => {
        expect(stripHtml('<br/>')).toBe('')
    })
})

describe('messageFormReducer', () => {
    describe('SET_TEXT', () => {
        it('updates contextText', () => {
            const state = messageFormReducer(baseState, {
                type: 'SET_TEXT',
                payload: 'hello',
            })
            expect(state.contextText).toBe('hello')
        })

        it('does not mutate other fields', () => {
            const state = messageFormReducer(
                { ...baseState, contextTitle: 'title' },
                { type: 'SET_TEXT', payload: 'text' },
            )
            expect(state.contextTitle).toBe('title')
        })
    })

    describe('SET_TITLE', () => {
        it('updates contextTitle', () => {
            const state = messageFormReducer(baseState, {
                type: 'SET_TITLE',
                payload: 'My Title',
            })
            expect(state.contextTitle).toBe('My Title')
        })

        it('does not mutate other fields', () => {
            const state = messageFormReducer(
                { ...baseState, contextText: 'text' },
                { type: 'SET_TITLE', payload: 'title' },
            )
            expect(state.contextText).toBe('text')
        })
    })

    describe('SET_IMAGE', () => {
        it('updates image', () => {
            const state = messageFormReducer(baseState, {
                type: 'SET_IMAGE',
                payload: 'https://example.com/img.png',
            })
            expect(state.image).toBe('https://example.com/img.png')
        })

        it('does not mutate other fields', () => {
            const state = messageFormReducer(
                { ...baseState, contextText: 'text' },
                { type: 'SET_IMAGE', payload: 'img.png' },
            )
            expect(state.contextText).toBe('text')
        })
    })

    describe('ADD_BUTTON', () => {
        it('appends a button with default values', () => {
            const state = messageFormReducer(baseState, { type: 'ADD_BUTTON' })
            expect(state.buttons).toHaveLength(1)
            const [btn] = state.buttons
            expect(btn.type).toBe('QUICK_REPLY')
            expect(btn.text).toBe('')
            expect(btn.value).toBe('')
            expect(typeof btn.id).toBe('string')
            expect(btn.id).not.toBe('')
        })

        it('appends multiple buttons independently', () => {
            const after1 = messageFormReducer(baseState, { type: 'ADD_BUTTON' })
            const after2 = messageFormReducer(after1, { type: 'ADD_BUTTON' })
            expect(after2.buttons).toHaveLength(2)
            expect(after2.buttons[0].id).not.toBe(after2.buttons[1].id)
        })

        it('does not mutate other fields', () => {
            const state = messageFormReducer(
                { ...baseState, contextText: 'text' },
                { type: 'ADD_BUTTON' },
            )
            expect(state.contextText).toBe('text')
        })
    })

    describe('REMOVE_BUTTON', () => {
        it('removes the button with the matching id', () => {
            const withButtons = messageFormReducer(baseState, {
                type: 'ADD_BUTTON',
            })
            const { id } = withButtons.buttons[0]
            const state = messageFormReducer(withButtons, {
                type: 'REMOVE_BUTTON',
                id,
            })
            expect(state.buttons).toHaveLength(0)
        })

        it('only removes the button with the given id', () => {
            const s1 = messageFormReducer(baseState, { type: 'ADD_BUTTON' })
            const s2 = messageFormReducer(s1, { type: 'ADD_BUTTON' })
            const idToRemove = s2.buttons[0].id
            const state = messageFormReducer(s2, {
                type: 'REMOVE_BUTTON',
                id: idToRemove,
            })
            expect(state.buttons).toHaveLength(1)
            expect(state.buttons[0].id).toBe(s2.buttons[1].id)
        })

        it('is a no-op when id does not match any button', () => {
            const withButton = messageFormReducer(baseState, {
                type: 'ADD_BUTTON',
            })
            const state = messageFormReducer(withButton, {
                type: 'REMOVE_BUTTON',
                id: 'non-existent-id',
            })
            expect(state.buttons).toHaveLength(1)
        })
    })

    describe('UPDATE_BUTTON', () => {
        it('updates text on the matching button', () => {
            const withButton = messageFormReducer(baseState, {
                type: 'ADD_BUTTON',
            })
            const { id } = withButton.buttons[0]
            const state = messageFormReducer(withButton, {
                type: 'UPDATE_BUTTON',
                id,
                patch: { text: 'Click me' },
            })
            expect(state.buttons[0].text).toBe('Click me')
        })

        it('updates type on the matching button', () => {
            const withButton = messageFormReducer(baseState, {
                type: 'ADD_BUTTON',
            })
            const { id } = withButton.buttons[0]
            const state = messageFormReducer(withButton, {
                type: 'UPDATE_BUTTON',
                id,
                patch: { type: 'URL' },
            })
            expect(state.buttons[0].type).toBe('URL')
        })

        it('leaves non-matching buttons unchanged', () => {
            const s1 = messageFormReducer(baseState, { type: 'ADD_BUTTON' })
            const s2 = messageFormReducer(s1, { type: 'ADD_BUTTON' })
            const idToUpdate = s2.buttons[0].id
            const state = messageFormReducer(s2, {
                type: 'UPDATE_BUTTON',
                id: idToUpdate,
                patch: { text: 'updated' },
            })
            expect(state.buttons[1].text).toBe('')
        })

        it('is a no-op when id does not match any button', () => {
            const withButton = messageFormReducer(baseState, {
                type: 'ADD_BUTTON',
            })
            const state = messageFormReducer(withButton, {
                type: 'UPDATE_BUTTON',
                id: 'non-existent-id',
                patch: { text: 'should not appear' },
            })
            expect(state.buttons[0].text).toBe('')
        })
    })

    describe('ADD_PRODUCT', () => {
        it('appends a product entry with default values', () => {
            const state = messageFormReducer(baseState, { type: 'ADD_PRODUCT' })
            expect(state.productEntries).toHaveLength(1)
            const [entry] = state.productEntries
            expect(entry.shopifyProduct).toBeUndefined()
            expect(entry.body).toBe('')
            expect(entry.url).toBe('')
            expect(typeof entry.id).toBe('string')
            expect(entry.id).not.toBe('')
        })

        it('appends multiple product entries independently', () => {
            const s1 = messageFormReducer(baseState, { type: 'ADD_PRODUCT' })
            const s2 = messageFormReducer(s1, { type: 'ADD_PRODUCT' })
            expect(s2.productEntries).toHaveLength(2)
            expect(s2.productEntries[0].id).not.toBe(s2.productEntries[1].id)
        })

        it('does not mutate other fields', () => {
            const state = messageFormReducer(
                { ...baseState, contextText: 'text' },
                { type: 'ADD_PRODUCT' },
            )
            expect(state.contextText).toBe('text')
        })
    })

    describe('REMOVE_PRODUCT', () => {
        it('removes the product entry with the matching id', () => {
            const withProduct = messageFormReducer(baseState, {
                type: 'ADD_PRODUCT',
            })
            const { id } = withProduct.productEntries[0]
            const state = messageFormReducer(withProduct, {
                type: 'REMOVE_PRODUCT',
                id,
            })
            expect(state.productEntries).toHaveLength(0)
        })

        it('only removes the entry with the given id', () => {
            const s1 = messageFormReducer(baseState, { type: 'ADD_PRODUCT' })
            const s2 = messageFormReducer(s1, { type: 'ADD_PRODUCT' })
            const idToRemove = s2.productEntries[0].id
            const state = messageFormReducer(s2, {
                type: 'REMOVE_PRODUCT',
                id: idToRemove,
            })
            expect(state.productEntries).toHaveLength(1)
            expect(state.productEntries[0].id).toBe(s2.productEntries[1].id)
        })

        it('is a no-op when id does not match any product', () => {
            const withProduct = messageFormReducer(baseState, {
                type: 'ADD_PRODUCT',
            })
            const state = messageFormReducer(withProduct, {
                type: 'REMOVE_PRODUCT',
                id: 'non-existent-id',
            })
            expect(state.productEntries).toHaveLength(1)
        })
    })

    describe('UPDATE_PRODUCT', () => {
        it('updates body on the matching product entry', () => {
            const withProduct = messageFormReducer(baseState, {
                type: 'ADD_PRODUCT',
            })
            const { id } = withProduct.productEntries[0]
            const state = messageFormReducer(withProduct, {
                type: 'UPDATE_PRODUCT',
                id,
                patch: { body: 'Great product' },
            })
            expect(state.productEntries[0].body).toBe('Great product')
        })

        it('updates url on the matching product entry', () => {
            const withProduct = messageFormReducer(baseState, {
                type: 'ADD_PRODUCT',
            })
            const { id } = withProduct.productEntries[0]
            const state = messageFormReducer(withProduct, {
                type: 'UPDATE_PRODUCT',
                id,
                patch: { url: 'https://example.com/product' },
            })
            expect(state.productEntries[0].url).toBe(
                'https://example.com/product',
            )
        })

        it('leaves non-matching entries unchanged', () => {
            const s1 = messageFormReducer(baseState, { type: 'ADD_PRODUCT' })
            const s2 = messageFormReducer(s1, { type: 'ADD_PRODUCT' })
            const idToUpdate = s2.productEntries[0].id
            const state = messageFormReducer(s2, {
                type: 'UPDATE_PRODUCT',
                id: idToUpdate,
                patch: { body: 'updated' },
            })
            expect(state.productEntries[1].body).toBe('')
        })

        it('is a no-op when id does not match any product entry', () => {
            const withProduct = messageFormReducer(baseState, {
                type: 'ADD_PRODUCT',
            })
            const state = messageFormReducer(withProduct, {
                type: 'UPDATE_PRODUCT',
                id: 'non-existent-id',
                patch: { body: 'should not appear' },
            })
            expect(state.productEntries[0].body).toBe('')
        })
    })
})
