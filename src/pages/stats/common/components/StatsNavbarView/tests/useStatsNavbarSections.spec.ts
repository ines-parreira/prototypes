import { AccordionValues } from 'components/Accordion/utils/types'
import useLocalStorage from 'hooks/useLocalStorage'
import { useStatsNavbarSections } from 'pages/stats/common/components/StatsNavbarView/useStatsNavbarSections'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/useLocalStorage')
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
