import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { isSessionImpersonated } from 'services/activityTracker/utils'

import { useSmsPhoneNumbers } from '../useSmsPhoneNumbers'

jest.mock('hooks/useAppSelector')
jest.mock('services/activityTracker/utils')

const mockUseAppSelector = jest.mocked(useAppSelector)
const mockIsSessionImpersonated = jest.mocked(isSessionImpersonated)
describe('useSmsPhoneNumbers', () => {
    beforeEach(() => {
        mockIsSessionImpersonated.mockReturnValue(false)
    })

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

    it('should return only non-marketing phone numbers', () => {
        const mockSmsPhoneNumbers = [
            {
                id: 1,
                phoneNumberName: 'SMS Phone 1',
                address: '+1234567890',
                isDeactivated: false,
                channel: 'sms',
                type: 'sms',
                name: '[MKT] Laccetti CA - SMS',
            },
            {
                id: 2,
                phoneNumberName: 'SMS Phone 2',
                address: '+0987654321',
                isDeactivated: false,
                channel: 'sms',
                type: 'sms',
                name: 'SMS Phone 2',
            },
        ]

        mockUseAppSelector.mockReturnValue(fromJS(mockSmsPhoneNumbers))

        const { result } = renderHook(() => useSmsPhoneNumbers())

        expect(result.current).toEqual(mockSmsPhoneNumbers.slice(1))
    })

    it('should return all phone numbers if session is impersonated', () => {
        const mockSmsPhoneNumbers = [
            {
                id: 1,
                phoneNumberName: 'SMS Phone 1',
                address: '+1234567890',
                isDeactivated: false,
                channel: 'sms',
                type: 'sms',
                name: '[MKT] Laccetti CA - SMS',
            },
            {
                id: 2,
                phoneNumberName: 'SMS Phone 2',
                address: '+0987654321',
                isDeactivated: false,
                channel: 'sms',
                type: 'sms',
                name: 'SMS Phone 2',
            },
        ]

        mockIsSessionImpersonated.mockReturnValue(true)

        const { result } = renderHook(() => useSmsPhoneNumbers())

        expect(result.current).toEqual(mockSmsPhoneNumbers)
    })
})
