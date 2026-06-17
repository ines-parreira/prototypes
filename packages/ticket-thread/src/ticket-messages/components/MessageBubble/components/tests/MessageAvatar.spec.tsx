import { useGetCustomer } from '@repo/customer/hooks'

import {
    mockGetUserAvailabilityHandler,
    mockTicketMessageUserOrCustomer,
} from '@gorgias/helpdesk-mocks'

import { server } from '#tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { render } from '#tests/render.utils'
import { MessageAvatar } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageAvatar'

vi.mock('@repo/customer/hooks', () => ({
    useGetCustomer: vi.fn(),
}))

vi.mock('#shared/hooks/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(() => ({
        format: {
            relative: 'YYYY-MM-DD',
            compact: 'YYYY-MM-DD HH:mm',
        },
        timezone: undefined,
    })),
}))

const mockUseGetCustomer = vi.mocked(useGetCustomer)

const sender = mockTicketMessageUserOrCustomer({
    id: 123,
    name: 'Alice Customer',
    email: 'alice@example.com',
})

beforeEach(() => {
    mockUseGetCustomer.mockReturnValue({ data: undefined } as ReturnType<
        typeof useGetCustomer
    >)
    server.use(mockGetUserAvailabilityHandler().handler)
})

describe('MessageAvatar', () => {
    it('does not fetch customer last-seen data by default', () => {
        render(<MessageAvatar sender={sender} />)

        expect(mockUseGetCustomer).toHaveBeenCalledWith(
            sender.id,
            undefined,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: false,
                }),
            }),
        )
    })

    it('fetches customer last-seen data when enabled for the last customer message', () => {
        render(<MessageAvatar sender={sender} showCustomerLastSeenStatus />)

        expect(mockUseGetCustomer).toHaveBeenCalledWith(
            sender.id,
            undefined,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                }),
            }),
        )
    })

    it('uses the agent availability endpoint for agent avatars', async () => {
        const getUserAvailabilityMock = mockGetUserAvailabilityHandler()
        const waitForGetUserAvailabilityRequest =
            getUserAvailabilityMock.waitForRequest(server)
        server.use(getUserAvailabilityMock.handler)

        render(<MessageAvatar sender={sender} fromAgent />)

        expect(mockUseGetCustomer).toHaveBeenCalledWith(
            sender.id,
            undefined,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: false,
                }),
            }),
        )
        await waitForGetUserAvailabilityRequest((request) => {
            expect(new URL(request.url).pathname).toContain(`/${sender.id}`)
        })
    })
})
