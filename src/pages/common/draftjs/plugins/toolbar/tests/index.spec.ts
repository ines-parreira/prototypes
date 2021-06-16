import {KeyboardEvent} from 'react'

import createPlugin from '../index'
import {ActionName} from '../types'

describe('toolbar plugin', () => {
    describe('Mod+K keybinding', () => {
        it('should emit insert-link command if link active', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => [ActionName.Link],
                onLinkCreate: () => undefined,
                onLinkEdit: () => undefined,
            })
            const ctrlA = plugin.keyBindingFn({
                key: 'a',
                ctrlKey: true,
            } as KeyboardEvent)
            const ctrlK = plugin.keyBindingFn({
                key: 'k',
                ctrlKey: true,
            } as KeyboardEvent)
            expect(ctrlA).not.toBe('insert-link')
            expect(ctrlK).toBe('insert-link')
        })

        it('should not emit insert-link keybinding if link not active', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => [],
                onLinkCreate: () => undefined,
                onLinkEdit: () => undefined,
            })
            const ctrlK = plugin.keyBindingFn({
                key: 'k',
                ctrlKey: true,
            } as KeyboardEvent)
            expect(ctrlK).not.toBe('insert-link')
        })
    })
})
