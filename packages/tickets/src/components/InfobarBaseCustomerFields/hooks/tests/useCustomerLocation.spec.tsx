import { renderHook } from '@testing-library/react'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { useCustomerLocation } from '../useCustomerLocation'

describe('useCustomerLocation', () => {
    it('should return location when both city and country are available', () => {
        const customer: Partial<TicketCustomer> = {
            meta: {
                location_info: {
                    city: 'New York',
                    country_name: 'United States',
                },
            },
        }

        const { result } = renderHook(() =>
            useCustomerLocation(customer as TicketCustomer),
        )

        expect(result.current.location).toBe('New York, United States')
    })

    it('should return only city when country is not available', () => {
        const customer: Partial<TicketCustomer> = {
            meta: {
                location_info: {
                    city: 'New York',
                },
            },
        }

        const { result } = renderHook(() =>
            useCustomerLocation(customer as TicketCustomer),
        )

        expect(result.current.location).toBe('New York')
    })

    it('should return only country when city is not available', () => {
        const customer: Partial<TicketCustomer> = {
            meta: {
                location_info: {
                    country_name: 'United States',
                },
            },
        }

        const { result } = renderHook(() =>
            useCustomerLocation(customer as TicketCustomer),
        )

        expect(result.current.location).toBe('United States')
    })

    it('should extract timezone offset when available', () => {
        const customer: Partial<TicketCustomer> = {
            meta: {
                location_info: {
                    city: 'New York',
                    country_name: 'United States',
                    time_zone: {
                        offset: '-05:00',
                    },
                },
            },
        }

        const { result } = renderHook(() =>
            useCustomerLocation(customer as TicketCustomer),
        )

        expect(result.current.timezoneOffset).toBe('-05:00')
    })
})
