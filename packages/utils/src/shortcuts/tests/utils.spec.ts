import * as utils from '../utils'

describe('shortcutManager utils', () => {
    describe('closest', () => {
        let fragment: HTMLDivElement

        beforeEach(() => {
            fragment = document.createElement('div')
            fragment.innerHTML =
                '<div class="pizza"><div><div class="pepperoni"></div></div></div>'
        })

        it('match parent', () => {
            expect(
                utils.closest(
                    fragment.querySelector('.pepperoni') as Element,
                    '.pizza',
                ),
            ).toBe(fragment?.querySelector('.pizza'))
        })

        it('not match anything', () => {
            expect(
                utils.closest(
                    fragment.querySelector('.pepperoni') as Element,
                    '.test',
                ),
            ).toBe(null)
        })
    })

    describe('getModifier', () => {
        it('modifier string', () => {
            const isMac = navigator.platform.toLowerCase().startsWith('mac')
            const mod = isMac ? '⌘' : 'Ctrl'
            expect(utils.getModifier()).toBe(mod)
        })
    })

    describe('isGlobalNavigationButton', () => {
        it('returns true for global navigation button', () => {
            const button = document.createElement('button')
            button.setAttribute('aria-label', 'Menu')
            document.body.appendChild(button)
            expect(utils.isGlobalNavigationButton(button)).toBe(true)
        })

        it('returns false for non-global navigation button', () => {
            const button = document.createElement('button')
            expect(utils.isGlobalNavigationButton(button)).toBe(false)
        })
    })

    describe('is editable', () => {
        let input: HTMLInputElement
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

        it('search input', () => {
            input.type = 'search'
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

        it('contenteditable true', () => {
            const editable = document.createElement('div')
            editable.contentEditable = 'true'
            expect(utils.isEditable(editable)).toBe(true)
        })

        it('contenteditable false', () => {
            const nonEditable = document.createElement('div')
            nonEditable.contentEditable = 'false'
            expect(utils.isEditable(nonEditable)).toBe(false)
        })

        it('not editable', () => {
            const notEditable = document.createElement('div')
            expect(utils.isEditable(notEditable)).toBe(false)
        })

        it('searchbox role', () => {
            const searchbox = document.createElement('div')
            searchbox.setAttribute('role', 'searchbox')
            expect(utils.isEditable(searchbox)).toBe(true)
        })

        it('textbox role ancestor', () => {
            const textbox = document.createElement('div')
            const child = document.createElement('span')

            textbox.setAttribute('role', 'textbox')
            textbox.appendChild(child)

            expect(utils.isEditable(child)).toBe(true)
        })

        it('combobox role ancestor', () => {
            const combobox = document.createElement('div')
            const child = document.createElement('span')

            combobox.setAttribute('role', 'combobox')
            combobox.appendChild(child)

            expect(utils.isEditable(child)).toBe(true)
        })

        it('role-like value does not match editable role selector', () => {
            const nonEditable = document.createElement('div')
            nonEditable.setAttribute('role', 'listbox')
            expect(utils.isEditable(nonEditable)).toBe(false)
        })

        it('contenteditable ancestor', () => {
            const editable = document.createElement('div')
            const child = document.createElement('span')

            editable.contentEditable = 'true'
            editable.appendChild(child)

            expect(utils.isEditable(child)).toBe(true)
        })
    })

    describe('is button', () => {
        const input = document.createElement('input')
        const button = document.createElement('button')
        const submit = document.createElement('input')
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
})
