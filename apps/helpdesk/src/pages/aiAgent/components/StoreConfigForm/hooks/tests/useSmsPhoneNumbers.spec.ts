import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import { useSmsPhoneNumbers } from '../useSmsPhoneNumbers'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = jest.mocked(useAppSelector)

describe('useSmsPhoneNumbers', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return SMS phone numbers from selector', () => {
        const mockSmsPhoneNumbers = [
            {
                id: 1,
                phoneNumberName: 'SMS Phone 1',
                address: '+1234567890',
                isDeactivated: false,
                channel: 'sms',
                type: 'sms',
                name: 'SMS Integration 1',
            },
            {
                id: 2,
                phoneNumberName: 'SMS Phone 2',
                address: '+0987654321',
                isDeactivated: false,
                channel: 'sms',
                type: 'sms',
                name: 'SMS Integration 2',
            },
        ]

        mockUseAppSelector.mockReturnValue(fromJS(mockSmsPhoneNumbers))

        const { result } = renderHook(() => useSmsPhoneNumbers())

        expect(result.current).toEqual(mockSmsPhoneNumbers)
    })
})
