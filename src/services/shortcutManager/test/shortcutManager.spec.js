import {ShortcutManager} from '../shortcutManager'

describe('shortcutManager', () => {
    let sm
    let counter = 0
    const bump = () => counter++

    beforeEach(() => {
        counter = 0
        sm = new ShortcutManager()
    })

    it('bind component', () => {
        const actions = {
            ACTION_NAME: {
                key: 'p',
                action: bump
            }
        }
        sm.bind('pizza', actions)
        sm.trigger('p')

        expect(counter).toBe(1)
    })

    it('unbind component', () => {
        const actions = {
            ACTION_NAME: {
                key: 'p',
                action: bump
            }
        }
        sm.bind('pizza', actions)
        sm.unbind('pizza')
        sm.trigger('p')

        expect(counter).toEqual(0)
    })

    it('support multiple events on combo', () => {
        const action = {
            key: 'p',
            action: bump
        }
        const anotherAction = {
            key: 'p',
            action: bump
        }
        sm.bind('pizza', {
            ACTION_NAME: action,
            ANOTHER_ACTION_NAME: anotherAction
        })
        sm.trigger('p')

        expect(counter).toBe(2)
    })

    it('only unbind events from component', () => {
        const action = {
            key: 'p',
            action: bump
        }
        const anotherAction = {
            key: 'p',
            action: bump
        }
        sm.bind('pizza', {
            ACTION_NAME: action,
        })
        sm.bind('pepperoni', {
            ANOTHER_ACTION_NAME: anotherAction
        })

        sm.unbind('pizza')
        sm.trigger('p')

        expect(counter).toBe(1)
    })

    it('not duplicate actions', () => {
        const action = {
            key: 'p',
            action: bump
        }
        sm.bind('pizza', {
            ACTION_NAME: action
        })
        sm.bind('pizza', {
            ACTION_NAME: action
        })
        sm.trigger('p')

        expect(counter).toBe(1)
    })

    it('rebind actions defined in different component', () => {
        const action = {
            key: 'p',
            action: bump
        }
        sm.bind('pizza', {
            ACTION_NAME: action,
        })
        sm.unbind('pizza')
        sm.bind('pizza')
        sm.trigger('p')

        expect(counter).toBe(1)
    })

    it('pause bound component', () => {
        const action = {
            key: 'p',
            action: bump
        }
        sm.bind('pizza', {
            ACTION_NAME: action,
        })
        sm.pause()
        sm.trigger('p')

        expect(counter).toBe(0)
    })

    it('pause unbound component', () => {
        const action = {
            key: 'p',
            action: bump
        }
        sm.pause()
        sm.bind('pizza', {
            ACTION_NAME: action,
        })
        sm.trigger('p')

        expect(counter).toBe(0)
    })
})
