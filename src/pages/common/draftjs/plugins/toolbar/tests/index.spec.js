//@flow
import createPlugin from '../index'

describe('toolbar plugin', () => {
    describe('Mod+K keybinding', () => {
        it('should emit insert-link command if link active', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => ['LINK'],
                onLinkCreate: () => undefined,
                onLinkEdit: () => undefined,
            })
            const ctrlA = plugin.keyBindingFn(
                (({key: 'a', ctrlKey: true}: any): SyntheticKeyboardEvent<*>)
            )
            const ctrlK = plugin.keyBindingFn(
                (({key: 'k', ctrlKey: true}: any): SyntheticKeyboardEvent<*>)
            )
            expect(ctrlA).not.toBe('insert-link')
            expect(ctrlK).toBe('insert-link')
        })

        it('should not emit insert-link keybinding if link not active', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => [],
                onLinkCreate: () => undefined,
                onLinkEdit: () => undefined,
            })
            const ctrlK = plugin.keyBindingFn(
                (({key: 'k', ctrlKey: true}: any): SyntheticKeyboardEvent<*>)
            )
            expect(ctrlK).not.toBe('insert-link')
        })
    })
})
