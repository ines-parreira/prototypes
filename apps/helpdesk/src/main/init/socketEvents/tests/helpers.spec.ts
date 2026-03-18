import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'

import {
    getThrottledUpdateForCustomFields,
    throttledUpdateCustomFieldsCache,
} from '../helpers'

jest.mock('api/queryClient', () => ({
    appQueryClient: {
        invalidateQueries: jest.fn(),
    },
}))

describe('throttledUpdateCustomFieldsCache()', () => {
    beforeEach(() => {
        getThrottledUpdateForCustomFields.cache.clear?.()
        jest.clearAllMocks()
    })

    it('should invalidate custom fields query keys', () => {
        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })

        expect(appQueryClient.invalidateQueries).toHaveBeenNthCalledWith(1, {
            queryKey: queryKeys.tickets.listTicketCustomFields(1),
        })
        expect(appQueryClient.invalidateQueries).toHaveBeenNthCalledWith(2, {
            queryKey: queryKeys.customers.listCustomerCustomFieldsValues(2),
        })
    })

    it('should not invalidate queries when ids are missing', () => {
        throttledUpdateCustomFieldsCache({})

        expect(appQueryClient.invalidateQueries).not.toHaveBeenCalled()
    })

    it('should throttle repeated calls for the same ids', () => {
        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })
        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })
        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })

        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(2)
    })

    it('should not throttle across different id pairs', () => {
        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })
        throttledUpdateCustomFieldsCache({ customerId: 3, ticketId: 1 })

        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(4)
    })

    it('should invalidate at most once every 5 seconds for the same ids', () => {
        jest.useFakeTimers()

        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(2)

        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })
        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(2)

        jest.advanceTimersByTime(5_000)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(4)

        throttledUpdateCustomFieldsCache({ customerId: 2, ticketId: 1 })
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(6)
    })
})
