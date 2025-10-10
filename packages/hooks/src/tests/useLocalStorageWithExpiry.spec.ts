import { renderHook } from '@repo/testing/vitest'
import { type Mock } from 'vitest'

import { useLocalStorage } from '../useLocalStorage'
import { useLocalStorageWithExpiry } from '../useLocalStorageWithExpiry'

vi.mock('../useLocalStorage')
const useLocalStorageMock = useLocalStorage as unknown as Mock

const EXPIRY_TIME = 1000

const mockSetter = vi.fn()
const mockRemover = vi.fn()
let mockedDate: number

describe('useLocalStorageWithExpiry', () => {
    beforeEach(() => {
        mockSetter.mockClear()
        mockRemover.mockClear()
        useLocalStorageMock.mockReturnValue(['', mockSetter, mockRemover])
        mockedDate = new Date(2024).getTime()

        vi.useFakeTimers()
        vi.setSystemTime(mockedDate)
    })

    it('should return the default value', () => {
        useLocalStorageMock.mockReturnValue(['default value', vi.fn(), vi.fn()])

        const { result } = renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME, 'default value'),
        )

        expect(result.current.state).toBe('default value')
    })

    it('should set the value passed and update the timestamp', () => {
        const { result } = renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME, ''),
        )

        result.current.setState('new value')

        expect(mockSetter).toHaveBeenNthCalledWith(1, 'new value')
        expect(mockSetter).toHaveBeenNthCalledWith(2, mockedDate)
    })

    it('should remove the key / value pair if expired and replace with default value on render cycle', () => {
        useLocalStorageMock
            .mockReturnValueOnce(['default value', mockSetter, vi.fn()])
            .mockReturnValueOnce([
                mockedDate - (EXPIRY_TIME + 1),
                mockSetter,
                vi.fn(),
            ])

        renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME, 'default value'),
        )

        expect(mockSetter).toHaveBeenCalledTimes(2)
        expect(mockSetter).toHaveBeenCalledWith('default value')
        expect(mockSetter).toHaveBeenCalledWith(mockedDate)
    })

    it('should remove the key / value pair as well as the writing datetime', () => {
        const { result } = renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME, ''),
        )

        result.current.remove()

        expect(mockRemover).toHaveBeenCalledTimes(2)
    })
})
