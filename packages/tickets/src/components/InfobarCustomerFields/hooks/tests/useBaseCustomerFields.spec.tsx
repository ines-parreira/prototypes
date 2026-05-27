import { act, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockTicketCustomer,
    mockUpdateCustomerHandler,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../../tests/render.utils'
import { useBaseCustomerFields } from '../useBaseCustomerFields'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useBaseCustomerFields', () => {
    it('should initialize with customer data', async () => {
        const customer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [
                {
                    id: 1,
                    address: 'john@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
            ],
            note: 'Customer note',
        })

        const { result } = renderHook(() =>
            useBaseCustomerFields({ ticketId: '123', customer }),
        )

        expect(result.current.note).toBe('Customer note')
        expect(result.current.emailChannels).toHaveLength(1)
        expect(result.current.emailChannels[0].address).toBe('john@example.com')
    })

    it('should sync local fields when customer data updates', async () => {
        const initialCustomer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'old@example.com',
            channels: [
                {
                    id: 1,
                    address: 'old@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
            ],
            note: 'Old note',
        })
        const updatedCustomer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'new@example.com',
            channels: [
                {
                    id: 1,
                    address: 'new@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
            ],
            note: 'New note',
        })

        const { result, rerender } = renderHook(
            ({ customer }) =>
                useBaseCustomerFields({ ticketId: '123', customer }),
            {
                initialProps: { customer: initialCustomer },
            },
        )

        expect(result.current.note).toBe('Old note')
        expect(result.current.emailChannels[0].address).toBe('old@example.com')

        rerender({ customer: updatedCustomer })

        await waitFor(() => {
            expect(result.current.note).toBe('New note')
            expect(result.current.emailChannels[0].address).toBe(
                'new@example.com',
            )
        })
    })

    it('should clear local fields when customer data is removed', async () => {
        const initialCustomer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'old@example.com',
            channels: [
                {
                    id: 1,
                    address: 'old@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
            ],
            note: 'Old note',
        })

        const { result, rerender } = renderHook(
            ({ customer }) =>
                useBaseCustomerFields({ ticketId: '123', customer }),
            {
                initialProps: {
                    customer: initialCustomer as
                        | typeof initialCustomer
                        | undefined,
                },
            },
        )

        rerender({ customer: undefined })

        await waitFor(() => {
            expect(result.current.note).toBe('')
            expect(result.current.emailChannels).toHaveLength(0)
        })
    })

    it('should call handleNoteBlur with correct note value', async () => {
        const customer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [],
            note: 'Old note',
        })

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockUpdateCustomer.handler)

        const { result } = renderHook(() =>
            useBaseCustomerFields({ ticketId: '123', customer }),
        )

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        await act(async () => {
            await result.current.handleNoteBlur('New note')
        })

        await waitForRequest(async (request) => {
            const body = await request.clone().json()
            expect(body.note).toBe('New note')
        })
    })

    it('should add new channel when createChannel is called', async () => {
        const customer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [
                {
                    id: 1,
                    address: 'john@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
            ],
            note: '',
        })

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockUpdateCustomer.handler)

        const { result } = renderHook(() =>
            useBaseCustomerFields({ ticketId: '123', customer }),
        )

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        await act(async () => {
            await result.current.createChannel('phone', '+1234567890')
        })

        await waitForRequest(async (request) => {
            const body = await request.clone().json()
            expect(body.channels).toHaveLength(2)
            expect(body.channels[1]).toMatchObject({
                address: '+1234567890',
                type: 'phone',
                preferred: false,
            })
        })
        expect(result.current.fields.phone).toBe('')
    })

    it('should not create a channel when the address is blank', async () => {
        const customer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [
                {
                    id: 1,
                    address: 'john@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
            ],
            note: '',
        })

        const { result } = renderHook(() =>
            useBaseCustomerFields({ ticketId: '123', customer }),
        )

        await act(async () => {
            await result.current.createChannel('email', '   ')
        })

        expect(result.current.emailChannels).toHaveLength(1)
        expect(result.current.emailChannels[0].address).toBe('john@example.com')
    })

    it('should update local channel state when handleChannelChange is called', async () => {
        const customer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'old@example.com',
            channels: [
                {
                    id: 1,
                    address: 'old@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
            ],
            note: '',
        })

        const { result } = renderHook(() =>
            useBaseCustomerFields({ ticketId: '123', customer }),
        )

        await act(async () => {
            await result.current.handleChannelChange(1, 'draft@example.com')
        })

        expect(result.current.emailChannels[0].address).toBe(
            'draft@example.com',
        )
    })

    it('should update existing channel when updateChannel is called', async () => {
        const customer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'old@example.com',
            channels: [
                {
                    id: 1,
                    address: 'old@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
                {
                    id: 2,
                    address: '+1234567890',
                    type: 'phone',
                    preferred: false,
                } as TicketCustomerChannel,
            ],
            note: '',
        })

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockUpdateCustomer.handler)

        const { result } = renderHook(() =>
            useBaseCustomerFields({ ticketId: '123', customer }),
        )

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        act(() => {
            result.current.updateChannel(1, 'new@example.com')
        })

        await waitForRequest(async (request) => {
            const body = await request.clone().json()
            expect(body.channels).toHaveLength(2)
            const updatedChannel = body.channels.find((ch: any) => ch.id === 1)
            expect(updatedChannel).toMatchObject({
                address: 'new@example.com',
                type: 'email',
            })
        })
    })

    it('should delete channel when deleteChannel is called', async () => {
        const customer = mockTicketCustomer({
            id: 456,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [
                {
                    id: 1,
                    address: 'john@example.com',
                    type: 'email',
                    preferred: true,
                } as TicketCustomerChannel,
                {
                    id: 2,
                    address: '+1234567890',
                    type: 'phone',
                    preferred: false,
                } as TicketCustomerChannel,
            ],
            note: '',
        })

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockUpdateCustomer.handler)

        const { result } = renderHook(() =>
            useBaseCustomerFields({ ticketId: '123', customer }),
        )

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        act(() => {
            result.current.deleteChannel(2)
        })

        await waitForRequest(async (request) => {
            const body = await request.clone().json()
            expect(body.channels).toHaveLength(1)
            expect(body.channels[0]).toMatchObject({
                id: 1,
                address: 'john@example.com',
                type: 'email',
            })
        })
    })
})
