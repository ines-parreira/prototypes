import { useLocalStorage } from '@repo/hooks'
import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import type { AccordionValues } from 'components/Accordion/utils/types'
import {
    VOICE_OF_CUSTOMER_NAVBAR_SECTIONS_KEY,
    VoiceOfCustomerViewSections,
} from 'domains/reporting/pages/voice-of-customer/constants'
import { useVoiceOfCustomerSections } from 'domains/reporting/pages/voice-of-customer/useVoiceOfCustomerSections'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useLocalStorage: jest.fn(),
}))
const useLocalStorageMock = assumeMock(useLocalStorage<AccordionValues>)

describe('useVoiceOfCustomerSections', () => {
    const mockSetter = jest.fn()
    const defaultSections = Object.values(VoiceOfCustomerViewSections)

    beforeEach(() => {
        useLocalStorageMock.mockReturnValue([
            defaultSections,
            mockSetter,
            jest.fn(),
        ])
        localStorage.clear()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should initialize with default sections from VoiceOfCustomerViewSections', () => {
        const { result } = renderHook(() => useVoiceOfCustomerSections())

        expect(useLocalStorageMock).toHaveBeenCalledWith(
            VOICE_OF_CUSTOMER_NAVBAR_SECTIONS_KEY,
            defaultSections,
        )
        expect(result.current.sections).toEqual(defaultSections)
    })

    it('should return sections from localStorage', () => {
        const storedSections: AccordionValues = [
            VoiceOfCustomerViewSections.ProductInsights,
        ]
        useLocalStorageMock.mockReturnValue([
            storedSections,
            mockSetter,
            jest.fn(),
        ])

        const { result } = renderHook(() => useVoiceOfCustomerSections())

        expect(result.current.sections).toEqual(storedSections)
    })

    it('should update sections when handleNavigationStateChange is called', () => {
        const { result } = renderHook(() => useVoiceOfCustomerSections())
        const newSections: AccordionValues = []

        act(() => {
            result.current.handleNavigationStateChange(newSections)
        })

        expect(mockSetter).toHaveBeenCalledWith(newSections)
    })

    it('should memoize the handleNavigationStateChange function', () => {
        const { result, rerender } = renderHook(() =>
            useVoiceOfCustomerSections(),
        )

        const initialCallback = result.current.handleNavigationStateChange
        rerender()

        expect(result.current.handleNavigationStateChange).toBe(initialCallback)
    })
})
