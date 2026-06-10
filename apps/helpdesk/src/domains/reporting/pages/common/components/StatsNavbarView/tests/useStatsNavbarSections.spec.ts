import { assumeMock, renderHook } from '@repo/testing'
import { useLocalStorage } from '@gorgias/toolkit-react'

import type { AccordionValues } from 'components/Accordion/utils/types'
import { useStatsNavbarSections } from 'domains/reporting/pages/common/components/StatsNavbarView/useStatsNavbarSections'

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useLocalStorage: jest.fn(),
}))
const useLocalStorageMock =
    assumeMock<typeof useLocalStorage<AccordionValues>>(useLocalStorage)

describe('useStatsNavbarSections', () => {
    it('should read the state of Sections from local storage', () => {
        const storedSections: AccordionValues = ['abc', 'cde']
        useLocalStorageMock.mockReturnValue([
            storedSections,
            jest.fn(),
            jest.fn(),
        ])

        const { result } = renderHook(() => useStatsNavbarSections())

        expect(result.current.sections).toEqual(storedSections)
    })

    it('should store the state of Sections in local storage', () => {
        const storedSections: AccordionValues = ['abc', 'cde']
        const newSection = 'xyz'
        const storageHandler = jest.fn()
        useLocalStorageMock.mockReturnValue([
            storedSections,
            storageHandler,
            jest.fn(),
        ])

        const { result } = renderHook(() => useStatsNavbarSections())
        result.current.handleNavigationStateChange([newSection])

        expect(storageHandler).toHaveBeenCalledWith([newSection])
    })
})
