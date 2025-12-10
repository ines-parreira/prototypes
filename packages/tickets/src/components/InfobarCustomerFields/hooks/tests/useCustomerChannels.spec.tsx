import { renderHook } from '@testing-library/react'

import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'

import { useCustomerChannels } from '../useCustomerChannels'

describe('useCustomerChannels', () => {
    it('should return empty arrays when no channels provided', () => {
        const { result } = renderHook(() => useCustomerChannels(undefined))

        expect(result.current.emailChannels).toEqual([])
        expect(result.current.phoneChannels).toEqual([])
        expect(result.current.otherChannels).toEqual([])
    })

    it('should filter and categorize channels by type', () => {
        const channels = [
            {
                id: 1,
                address: 'test@example.com',
                type: 'email',
                preferred: false,
            },
            {
                id: 2,
                address: '+1234567890',
                type: 'phone',
                preferred: false,
            },
            {
                id: 3,
                address: '+15555555555',
                type: 'whatsapp',
                preferred: false,
            },
        ] as TicketCustomerChannel[]

        const { result } = renderHook(() => useCustomerChannels(channels))

        expect(result.current.emailChannels).toHaveLength(1)
        expect(result.current.phoneChannels).toHaveLength(1)
        expect(result.current.otherChannels).toHaveLength(1)
        expect(result.current.otherChannels[0].type).toBe('whatsapp')
    })

    it('should filter out excluded channel types', () => {
        const channels = [
            {
                id: 1,
                address: 'test@example.com',
                type: 'email',
                preferred: false,
            },
            { id: 2, address: 'chat-123', type: 'chat', preferred: false },
            {
                id: 3,
                address: 'fb-user',
                type: 'facebook',
                preferred: false,
            },
            {
                id: 4,
                address: 'ig-user',
                type: 'instagram',
                preferred: false,
            },
            {
                id: 5,
                address: 'ig-dm',
                type: 'instagram-direct-message',
                preferred: false,
            },
            {
                id: 6,
                address: 'twitter-user',
                type: 'twitter',
                preferred: false,
            },
        ] as TicketCustomerChannel[]

        const { result } = renderHook(() => useCustomerChannels(channels))

        expect(result.current.emailChannels).toHaveLength(1)
        expect(result.current.phoneChannels).toHaveLength(0)
        expect(result.current.otherChannels).toHaveLength(0)
    })

    it('should filter out channels without address', () => {
        const channels = [
            {
                id: 1,
                address: 'test@example.com',
                type: 'email',
                preferred: false,
            },
            { id: 3, address: null, type: 'phone', preferred: false },
        ] as TicketCustomerChannel[]

        const { result } = renderHook(() => useCustomerChannels(channels))

        expect(result.current.emailChannels).toHaveLength(1)
        expect(result.current.phoneChannels).toHaveLength(0)
    })

    it('should sort channels alphabetically by address', () => {
        const channels: TicketCustomerChannel[] = [
            {
                id: 1,
                address: 'zebra@example.com',
                type: 'email',
                preferred: true,
            },
            {
                id: 2,
                address: 'alpha@example.com',
                type: 'email',
                preferred: false,
            },
            {
                id: 3,
                address: 'beta@example.com',
                type: 'email',
                preferred: false,
            },
        ] as TicketCustomerChannel[]

        const { result } = renderHook(() => useCustomerChannels(channels))

        expect(result.current.emailChannels[0].address).toBe(
            'alpha@example.com',
        )
        expect(result.current.emailChannels[1].address).toBe('beta@example.com')
        expect(result.current.emailChannels[2].address).toBe(
            'zebra@example.com',
        )
    })

    it('should sort other channels by type first, then alphabetically', () => {
        const channels = [
            {
                id: 1,
                address: '+15555555555',
                type: 'whatsapp',
                preferred: false,
            },
            {
                id: 2,
                address: '+12222222222',
                type: 'sms',
                preferred: true,
            },
            {
                id: 3,
                address: '+11111111111',
                type: 'sms',
                preferred: false,
            },
            {
                id: 4,
                address: '+13333333333',
                type: 'whatsapp',
                preferred: true,
            },
        ] as TicketCustomerChannel[]

        const { result } = renderHook(() => useCustomerChannels(channels))

        expect(result.current.otherChannels[0].type).toBe('sms')
        expect(result.current.otherChannels[0].address).toBe('+11111111111')
        expect(result.current.otherChannels[1].type).toBe('sms')
        expect(result.current.otherChannels[1].address).toBe('+12222222222')
        expect(result.current.otherChannels[2].type).toBe('whatsapp')
        expect(result.current.otherChannels[2].address).toBe('+13333333333')
        expect(result.current.otherChannels[3].type).toBe('whatsapp')
        expect(result.current.otherChannels[3].address).toBe('+15555555555')
    })
})
