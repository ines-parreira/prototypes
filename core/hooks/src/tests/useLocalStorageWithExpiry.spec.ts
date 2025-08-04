import { renderHook } from '@repo/testing'

import { useLocalStorage } from '../useLocalStorage'
import { useLocalStorageWithExpiry } from '../useLocalStorageWithExpiry'

jest.mock('../useLocalStorage')
const useLocalStorageMock = useLocalStorage as jest.Mock

const EXPIRY_TIME = 1000

const mockSetter = jest.fn()
const mockRemover = jest.fn()
let mockedDate: number

describe('useLocalStorageWithExpiry', () => {
    beforeEach(() => {
        useLocalStorageMock.mockReturnValue(['', mockSetter, mockRemover])
        mockedDate = new Date(2024).getTime()

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)
    })

    it('should return the default value', () => {
        useLocalStorageMock.mockReturnValue([
            'default value',
            jest.fn(),
            jest.fn(),
        ])

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
            .mockReturnValueOnce(['default value', mockSetter, jest.fn()])
            .mockReturnValueOnce([
                mockedDate - (EXPIRY_TIME + 1),
                mockSetter,
                jest.fn(),
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
