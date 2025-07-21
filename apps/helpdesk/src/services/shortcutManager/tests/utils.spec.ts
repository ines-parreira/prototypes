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
