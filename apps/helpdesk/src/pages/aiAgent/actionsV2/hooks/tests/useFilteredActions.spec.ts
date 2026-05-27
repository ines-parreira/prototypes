import { renderHook } from '@repo/testing'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { useFilteredActions } from '../useFilteredActions'

const make = (name: string): StoreWorkflowsConfiguration =>
    ({ id: name, name }) as StoreWorkflowsConfiguration

describe('useFilteredActions()', () => {
    it('returns all actions when search is empty', () => {
        const actions = [make('Cancel order'), make('Update stock')]
        const { result } = renderHook(() => useFilteredActions(actions, ''))
        expect(result.current).toEqual(actions)
    })

    it('matches by case-insensitive substring', () => {
        const actions = [
            make('Cancel order'),
            make('Update stock'),
            make('Send return portal link'),
        ]
        const { result } = renderHook(() =>
            useFilteredActions(actions, 'RETURN'),
        )
        expect(result.current).toEqual([actions[2]])
    })

    it('trims whitespace before matching', () => {
        const actions = [make('Cancel order'), make('Update stock')]
        const { result } = renderHook(() =>
            useFilteredActions(actions, '  cancel  '),
        )
        expect(result.current).toEqual([actions[0]])
    })

    it('returns empty when no actions match', () => {
        const { result } = renderHook(() =>
            useFilteredActions([make('Cancel order')], 'nothing'),
        )
        expect(result.current).toEqual([])
    })
})
