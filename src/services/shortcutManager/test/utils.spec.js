import * as utils from '../utils'

describe('shortcutManager utils', () => {
    describe('closest', () => {
        let fragment

        beforeEach(() => {
            fragment = document.createElement('div')
            fragment.innerHTML = '<div class="pizza"><div><div class="pepperoni"></div></div></div>'
        })

        it('match parent', () => {
            expect(utils.closest(fragment.querySelector('.pepperoni'), '.pizza')).toBe(fragment.querySelector('.pizza'))
        })

        it('not match anything', () => {
            expect(utils.closest(fragment.querySelector('.pepperoni'), '.test')).toBe(null)
        })
    })

    describe('getModifier', () => {
        it('modifier string', () => {
            const isMac = navigator.platform.toLowerCase().startsWith('mac')
            const mod = isMac ? '⌘' : 'Ctrl'
            expect(utils.getModifier()).toBe(mod)
        })
    })

    describe('is button', () => {
        const input = document.createElement('input')
        const button = document.createElement('button')
        let submit = document.createElement('input')
        submit.type = 'submit'

        it('input', () => {
            expect(utils.isButton(input)).toBe(false)
        })

        it('button', () => {
            expect(utils.isButton(button)).toBe(true)
        })

        it('input[type=submit]', () => {
            expect(utils.isButton(submit)).toBe(true)
        })
    })

    describe('is editable', () => {
        const input = document.createElement('input')
        const select = document.createElement('select')
        const textarea = document.createElement('textarea')

        const notEditable = document.createElement('div')

        it('input', () => {
            expect(utils.isEditable(input)).toBe(true)
        })

        it('select', () => {
            expect(utils.isEditable(select)).toBe(true)
        })

        it('textarea', () => {
            expect(utils.isEditable(textarea)).toBe(true)
        })

        // can't test for contenteditable,
        // jsdom does not support it.

        it('not editable', () => {
            expect(utils.isEditable(notEditable)).toBe(false)
        })
    })
})
