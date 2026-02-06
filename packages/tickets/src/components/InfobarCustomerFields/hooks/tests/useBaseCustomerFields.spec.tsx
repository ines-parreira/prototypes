import { act } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockTicketCustomer,
    mockUpdateCustomerHandler,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useBaseCustomerFields } from '../useBaseCustomerFields'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
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

        act(() => {
            result.current.handleNoteBlur('New note')
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

        act(() => {
            result.current.createChannel('phone', '+1234567890')
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
