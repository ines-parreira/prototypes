import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetTicketHandler,
    mockTicket,
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
    it('should return customer data from ticket', async () => {
        const ticket = mockTicket({
            id: 123,
            customer: mockTicketCustomer({
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
            }),
        })

        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(ticket),
        )

        server.use(mockGetTicket.handler)

        const { result } = renderHook(() => useBaseCustomerFields('123'))

        await waitFor(() => {
            expect(result.current.customer).toBeDefined()
            expect(result.current.customer?.id).toBe(456)
            expect(result.current.customer?.name).toBe('John Doe')
            expect(result.current.customer?.note).toBe('Customer note')
        })
    })

    it('should call handleNoteChange with correct note value', async () => {
        const ticket = mockTicket({
            id: 123,
            customer: mockTicketCustomer({
                id: 456,
                name: 'John Doe',
                email: 'john@example.com',
                channels: [],
                note: 'Old note',
            }),
        })

        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(ticket),
        )

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockGetTicket.handler, mockUpdateCustomer.handler)

        const { result } = renderHook(() => useBaseCustomerFields('123'))

        await waitFor(() => {
            expect(result.current.customer).toBeDefined()
        })

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        result.current.handleNoteChange('New note')

        await waitForRequest(async (request) => {
            const body = await request.clone().json()
            expect(body.note).toBe('New note')
        })
    })

    it('should add new channel when handleChannelChange is called with null channelId', async () => {
        const ticket = mockTicket({
            id: 123,
            customer: mockTicketCustomer({
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
            }),
        })

        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(ticket),
        )

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockGetTicket.handler, mockUpdateCustomer.handler)

        const { result } = renderHook(() => useBaseCustomerFields('123'))

        await waitFor(() => {
            expect(result.current.customer).toBeDefined()
        })

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        result.current.handleChannelChange(null, 'phone', '+1234567890')

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

    it('should update existing channel when handleChannelChange is called with existing channelId', async () => {
        const ticket = mockTicket({
            id: 123,
            customer: mockTicketCustomer({
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
            }),
        })

        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(ticket),
        )

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockGetTicket.handler, mockUpdateCustomer.handler)

        const { result } = renderHook(() => useBaseCustomerFields('123'))

        await waitFor(() => {
            expect(result.current.customer).toBeDefined()
        })

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        result.current.handleChannelChange(1, 'email', 'new@example.com')

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

    it('should delete channel when handleChannelChange is called with empty address', async () => {
        const ticket = mockTicket({
            id: 123,
            customer: mockTicketCustomer({
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
            }),
        })

        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(ticket),
        )

        const mockUpdateCustomer = mockUpdateCustomerHandler()

        server.use(mockGetTicket.handler, mockUpdateCustomer.handler)

        const { result } = renderHook(() => useBaseCustomerFields('123'))

        await waitFor(() => {
            expect(result.current.customer).toBeDefined()
        })

        const waitForRequest = mockUpdateCustomer.waitForRequest(server)

        result.current.handleChannelChange(2, 'phone', '')

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
