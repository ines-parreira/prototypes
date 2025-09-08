import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { CountryCode } from 'libphonenumber-js'

import useAppSelector from 'hooks/useAppSelector'
import { PhoneIntegration } from 'models/integration/types/phone'
import { UserSearchResult } from 'models/search/types'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'

import useDialerOutboundCall from '../useDialerOutboundCall'
import usePhoneDeviceDialer from '../usePhoneDeviceDialer'
import usePhoneNumbers from '../usePhoneNumbers'

jest.mock('hooks/useAppSelector')
jest.mock('../useDialerOutboundCall')
jest.mock('../usePhoneNumbers')
jest.mock('pages/phoneNumbers/utils')

const useAppSelectorMock = assumeMock(useAppSelector)
const useDialerOutboundCallMock = assumeMock(useDialerOutboundCall)
const usePhoneNumbersMock = assumeMock(usePhoneNumbers)
const getCountryFromPhoneNumberMock = assumeMock(getCountryFromPhoneNumber)

describe('usePhoneDeviceDialer', () => {
    const mockPhoneIntegrations: PhoneIntegration[] = [
        {
            id: 1,
            name: 'Primary Phone',
            meta: {
                phone_number_id: 1,
            },
        } as PhoneIntegration,
        {
            id: 2,
            name: 'Secondary Phone',
            meta: {
                phone_number_id: 2,
            },
        } as PhoneIntegration,
    ]

    const mockCustomer: UserSearchResult = {
        id: 1,
        address: '+15551234567',
        customer: {
            id: 1,
            name: 'Guybrush Threepwood',
        },
    }

    const mockMakeCall = jest.fn()
    const mockOnCallInitiated = jest.fn()
    const mockGetPhoneNumberById = jest.fn()

    const setup = () => {
        return renderHook(() =>
            usePhoneDeviceDialer({
                onCallInitiated: mockOnCallInitiated,
            }),
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useAppSelectorMock.mockImplementation(() => mockPhoneIntegrations)
        useDialerOutboundCallMock.mockReturnValue(mockMakeCall)
        usePhoneNumbersMock.mockReturnValue({
            getPhoneNumberById: mockGetPhoneNumberById,
        } as any)
        mockGetPhoneNumberById.mockReturnValue({
            phone_number: '+12125551234',
        })
        getCountryFromPhoneNumberMock.mockReturnValue('US' as CountryCode)
    })

    it('should initialize with default values', () => {
        const { result } = setup()

        expect(result.current.isPhoneNumberValid).toBe(false)
        expect(result.current.country).toBeUndefined()
        expect(result.current.phoneIntegrations).toEqual(mockPhoneIntegrations)
        expect(result.current.selectedIntegration).toEqual(
            mockPhoneIntegrations[0],
        )
    })

    describe('handleCall', () => {
        it('should manage phone number validation state', () => {
            const { result } = setup()

            expect(result.current.isPhoneNumberValid).toBe(false)

            act(() => {
                result.current.setIsPhoneNumberValid(true)
            })

            expect(result.current.isPhoneNumberValid).toBe(true)

            act(() => {
                result.current.setIsPhoneNumberValid(false)
            })

            expect(result.current.isPhoneNumberValid).toBe(false)
        })

        it('should make call with valid phone number', () => {
            const { result } = setup()

            act(() => {
                result.current.setIsPhoneNumberValid(true)
            })

            act(() => {
                result.current.setSelectedNumberAndCustomer('+15551234567')
            })

            act(() => {
                result.current.handleCall()
            })

            expect(useDialerOutboundCallMock).toHaveBeenCalledWith({
                inputValue: '+15551234567',
                selectedCustomer: null,
                selectedIntegration: mockPhoneIntegrations[0],
            })
            expect(mockMakeCall).toHaveBeenCalled()
            expect(mockOnCallInitiated).toHaveBeenCalled()
        })

        it('should make call with customer', () => {
            const { result } = setup()

            act(() => {
                result.current.setIsPhoneNumberValid(true)
            })

            act(() => {
                result.current.setSelectedNumberAndCustomer(
                    '+15551234567',
                    mockCustomer,
                )
            })

            act(() => {
                result.current.handleCall()
            })

            expect(useDialerOutboundCallMock).toHaveBeenCalledWith({
                inputValue: '+15551234567',
                selectedCustomer: mockCustomer,
                selectedIntegration: mockPhoneIntegrations[0],
            })
            expect(mockMakeCall).toHaveBeenCalled()
            expect(mockOnCallInitiated).toHaveBeenCalled()
        })

        it('should not make call with empty phone number', () => {
            const { result } = setup()

            act(() => {
                result.current.handleCall()
            })

            expect(mockMakeCall).not.toHaveBeenCalled()
            expect(mockOnCallInitiated).not.toHaveBeenCalled()
        })

        it('should not make call with invalid phone number', () => {
            const { result } = setup()

            act(() => {
                result.current.setSelectedNumberAndCustomer('123')
            })

            act(() => {
                result.current.handleCall()
            })

            expect(mockMakeCall).not.toHaveBeenCalled()
            expect(mockOnCallInitiated).not.toHaveBeenCalled()
        })
    })

    describe('integration selection', () => {
        it('should change selected integration', () => {
            const { result } = setup()

            act(() => {
                result.current.setSelectedIntegration(mockPhoneIntegrations[1])
            })

            expect(result.current.selectedIntegration).toEqual(
                mockPhoneIntegrations[1],
            )
        })

        it('should update country when changing integration with no selected number', () => {
            getCountryFromPhoneNumberMock.mockReturnValueOnce(
                'IT' as CountryCode,
            )

            const { result } = setup()

            expect(result.current.country).toBeUndefined()

            act(() => {
                result.current.setSelectedIntegration(mockPhoneIntegrations[1])
            })

            expect(mockGetPhoneNumberById).toHaveBeenCalledWith(
                mockPhoneIntegrations[1].meta.phone_number_id,
            )
            expect(getCountryFromPhoneNumberMock).toHaveBeenCalledWith(
                '+12125551234',
            )
            expect(result.current.country).toBe('IT')
        })

        it('should not update country when changing integration with selected number', () => {
            const { result } = setup()

            act(() => {
                result.current.setSelectedNumberAndCustomer('+15551234567')
            })

            act(() => {
                result.current.setSelectedIntegration(mockPhoneIntegrations[1])
            })

            expect(getCountryFromPhoneNumberMock).not.toHaveBeenCalled()
            expect(result.current.country).toBeUndefined()
        })

        it('should update useDialerOutboundCall when integration changes', () => {
            const { result } = setup()

            act(() => {
                result.current.setSelectedNumberAndCustomer(
                    '+15551234567',
                    mockCustomer,
                )
            })

            act(() => {
                result.current.setSelectedIntegration(mockPhoneIntegrations[1])
            })

            expect(useDialerOutboundCallMock).toHaveBeenLastCalledWith({
                inputValue: '+15551234567',
                selectedCustomer: mockCustomer,
                selectedIntegration: mockPhoneIntegrations[1],
            })
        })
    })

    describe('country management', () => {
        it('should allow setting country directly', () => {
            const { result } = setup()

            act(() => {
                result.current.setCountry('IT' as CountryCode)
            })

            expect(result.current.country).toBe('IT')
        })

        it('should preserve country when switching integrations with selected number', () => {
            const { result } = setup()

            act(() => {
                result.current.setCountry('IT' as CountryCode)
            })

            act(() => {
                result.current.setSelectedNumberAndCustomer('+441234567890')
            })

            act(() => {
                result.current.setSelectedIntegration(mockPhoneIntegrations[1])
            })

            expect(result.current.country).toBe('IT')
        })
    })
})
