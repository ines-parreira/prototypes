import _noop from 'lodash/noop'

import {ShortcutManager} from '../shortcutManager'

describe('shortcutManager', () => {
    let sm
    beforeEach(() => {
        sm = new ShortcutManager()
    })

    describe('cache', () => {
        it('cache hotkey action', () => {
            const action = {
                key: 'p',
                action: _noop
            }
            sm.bind('pizza', {
                ACTION_NAME: action
            })

            expect(sm._getHotkeys('p')).toMatchObject([action])
        })

        it('clear hotkey from cache', () => {
            const action = {
                key: 'p',
                action: _noop
            }
            sm.bind('pizza', {
                ACTION_NAME: action
            })
            sm.unbind('pizza')

            expect(sm._getHotkeys('p')).toEqual([])
        })

        it('support multiple events on combo', () => {
            const action = {
                key: 'p',
                action: () => {}
            }
            const anotherAction = {
                key: 'p',
                action: () => {}
            }
            sm.bind('pizza', {
                ACTION_NAME: action,
                ANOTHER_ACTION_NAME: anotherAction
            })

            expect(sm._getHotkeys('p')).toMatchObject([action, anotherAction])
        })

        it('only unbind events from component', () => {
            const action = {
                key: 'p',
                action: _noop
            }
            const anotherAction = {
                key: 'p',
                action: _noop
            }
            sm.bind('pizza', {
                ACTION_NAME: action,
            })
            sm.bind('pepperoni', {
                ANOTHER_ACTION_NAME: anotherAction
            })

            sm.unbind('pizza')

            expect(sm._getHotkeys('p')).toMatchObject([anotherAction])
        })

        it('not duplicate actions', () => {
            const action = {
                key: 'p',
                action: _noop
            }
            sm.bind('pizza', {
                ACTION_NAME: action
            })
            sm.bind('pizza', {
                ACTION_NAME: action
            })

            expect(sm._getHotkeys('p')).toMatchObject([action])
        })

        it('rebind actions defined in different component', () => {
            const action = {
                key: 'p',
                action: _noop
            }
            sm.bind('pizza', {
                ACTION_NAME: action,
            })
            sm.unbind('pizza')
            sm.bind('pizza')

            expect(sm._getHotkeys('p')).toMatchObject([action])
        })
    })
})
