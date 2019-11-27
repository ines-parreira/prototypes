import * as utils from '../utils'

describe('Services common utils', () => {
    describe('is editable', () => {
        let input
        beforeEach(() => {
            input = document.createElement('input')
        })

        it('default input', () => {
            expect(utils.isEditable(input)).toBe(true)
        })

        it('text input', () => {
            input.type = 'text'
            expect(utils.isEditable(input)).toBe(true)
        })

        it('checkbox', () => {
            input.type = 'checkbox'
            expect(utils.isEditable(input)).toBe(false)
        })

        it('radio', () => {
            input.type = 'radio'
            expect(utils.isEditable(input)).toBe(false)
        })

        it('select', () => {
            const select = document.createElement('select')
            expect(utils.isEditable(select)).toBe(true)
        })

        it('textarea', () => {
            const textarea = document.createElement('textarea')
            expect(utils.isEditable(textarea)).toBe(true)
        })

        // can't test for contenteditable,
        // jsdom does not support it.

        it('not editable', () => {
            const notEditable = document.createElement('div')
            expect(utils.isEditable(notEditable)).toBe(false)
        })
    })
})
