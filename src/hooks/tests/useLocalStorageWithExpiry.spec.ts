import {renderHook} from '@testing-library/react-hooks'

import useLocalStorage from 'hooks/useLocalStorage'
import useLocalStorageWithExpiry from 'hooks/useLocalStorageWithExpiry'

jest.mock('hooks/useLocalStorage')
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

    it('should return the initial value', () => {
        useLocalStorageMock.mockReturnValue([
            'initial value',
            jest.fn(),
            jest.fn(),
        ])

        const {result} = renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME, 'initial value')
        )

        expect(result.current.state).toBe('initial value')
    })

    it('should set the value passed and update the timestamp', () => {
        const {result} = renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME)
        )

        result.current.setState('new value')

        expect(mockSetter).toHaveBeenNthCalledWith(1, 'new value')
        expect(mockSetter).toHaveBeenNthCalledWith(2, mockedDate)
    })

    it('should remove the key / value pair if expired and replace with initial value on render cycle', () => {
        useLocalStorageMock
            .mockReturnValueOnce(['initial value', mockSetter, jest.fn()])
            .mockReturnValueOnce([
                mockedDate - (EXPIRY_TIME + 1),
                mockSetter,
                jest.fn(),
            ])

        renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME, 'initial value')
        )

        expect(mockSetter).toHaveBeenCalledTimes(2)
        expect(mockSetter).toHaveBeenCalledWith('initial value')
        expect(mockSetter).toHaveBeenCalledWith(mockedDate)
    })

    it('should remove the key / value pair if expired and not replace with initial value on render cycle', () => {
        useLocalStorageMock
            .mockReturnValueOnce(['initial value', mockSetter, mockRemover])
            .mockReturnValueOnce([
                mockedDate - (EXPIRY_TIME + 1),
                mockSetter,
                mockRemover,
            ])

        renderHook(() => useLocalStorageWithExpiry('key', EXPIRY_TIME))

        expect(mockRemover).toHaveBeenCalledTimes(2)
    })

    it('should remove the key / value pair as well as the writing datetime', () => {
        const {result} = renderHook(() =>
            useLocalStorageWithExpiry('key', EXPIRY_TIME)
        )

        result.current.remove()

        expect(mockRemover).toHaveBeenCalledTimes(2)
    })
})
