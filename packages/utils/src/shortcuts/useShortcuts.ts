import { useConditionalShortcuts } from './useConditionalShortcuts'

type Params = Parameters<typeof useConditionalShortcuts>

export function useShortcuts(component: Params[1], actions: Params[2]) {
    useConditionalShortcuts(true, component, actions)
}
