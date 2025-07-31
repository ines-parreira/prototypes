import { act, renderHook } from '@repo/testing'

import { useTicketTagsState } from '../useTicketTagsState'

describe('useTicketTagsState hook', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useTicketTagsState())
        expect(result.current.state).toEqual({
            selectedTicketTags: [],
            isSelectDisabled: false,
        })
    })

    it('should set selected tags correctly', () => {
        const { result } = renderHook(() => useTicketTagsState())
        const newTags = ['Tag1']

        act(() => {
            result.current.setSelectedTags(newTags)
        })

        expect(result.current.state.selectedTicketTags).toEqual(newTags)
    })

    it('should clear selected tags', () => {
        const { result } = renderHook(() => useTicketTagsState())
        const newTags = ['Tag1']

        // First set some tags
        act(() => {
            result.current.setSelectedTags(newTags)
        })
        expect(result.current.state.selectedTicketTags).toEqual(newTags)

        // Then clear the tags
        act(() => {
            result.current.clearSelectedTags()
        })
        expect(result.current.state.selectedTicketTags).toEqual([])
    })

    it('should set select disabled correctly', () => {
        const { result } = renderHook(() => useTicketTagsState())

        act(() => {
            result.current.setSelectDisabled(true)
        })
        expect(result.current.state.isSelectDisabled).toBe(true)
    })

    it('should not modify state when removeTag is called', () => {
        const { result } = renderHook(() => useTicketTagsState())
        const initialState = { ...result.current.state }

        act(() => {
            result.current.removeTag('someTag')
        })
        // The REMOVE_TAG action doesn't change state locally.
        expect(result.current.state).toEqual(initialState)
    })
})
