import { assumeMock, renderHook } from '@repo/testing'

import { useOutboundCall } from 'hooks/integrations/phone/useOutboundCall'
import { PhoneIntegration } from 'models/integration/types'
import * as userSelectors from 'state/currentUser/selectors'
import * as ticketSelectors from 'state/ticket/selectors'

import useDialerOutboundCall from '../useDialerOutboundCall'
import usePhoneNumbers from '../usePhoneNumbers'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('hooks/integrations/phone/useOutboundCall')
jest.mock('pages/integrations/integration/components/phone/usePhoneNumbers')
jest.mock('libphonenumber-js', () => ({
    parsePhoneNumber: (value: string) => ({
        format: () => `E.164_${value}`,
    }),
}))

const getCurrentUserIdSpy = jest.spyOn(userSelectors, 'getCurrentUserId')
const getTicketSpy = jest.spyOn(ticketSelectors, 'getTicket')

const useOutboundCallMock = assumeMock(useOutboundCall)
const usePhoneNumbersMock = assumeMock(usePhoneNumbers)

describe('useDialerOutboundCall', () => {
    const useOutboundCallMockFn = jest.fn()
    const render = ({ selectedCustomer }: { selectedCustomer: any }) =>
        renderHook(() =>
            useDialerOutboundCall({
                inputValue: 'inputValue',
                selectedCustomer,
                selectedIntegration: {
                    id: 1,
                    meta: {
                        phone_number_id: 1,
                    } as any,
                } as PhoneIntegration,
            }),
        )

    beforeEach(() => {
        getCurrentUserIdSpy.mockReturnValue(1)
        usePhoneNumbersMock.mockReturnValue({
            getPhoneNumberById: () => ({
                phone_number: 'phone_number',
            }),
        } as any)
        getTicketSpy.mockReturnValue({ id: 5 } as any)
        useOutboundCallMock.mockReturnValue(useOutboundCallMockFn)
    })

    it('should call useOutboundCall hook with inputValue', () => {
        const { result } = render({ selectedCustomer: null })

        result.current()

        expect(useOutboundCallMockFn).toHaveBeenCalledWith({
            agentId: 1,
            customerName: '',
            fromAddress: 'phone_number',
            integrationId: 1,
            ticketId: 5,
            toAddress: `E.164_inputValue`,
        })
    })

    it('should call useOutboundCall hook with selectedCustomer address', () => {
        const { result } = render({
            selectedCustomer: {
                address: 'address',
                customer: { name: 'name' },
            },
        })

        result.current()

        expect(useOutboundCallMockFn).toHaveBeenCalledWith({
            agentId: 1,
            customerName: 'name',
            fromAddress: 'phone_number',
            integrationId: 1,
            ticketId: 5,
            toAddress: `E.164_address`,
        })
    })
})
