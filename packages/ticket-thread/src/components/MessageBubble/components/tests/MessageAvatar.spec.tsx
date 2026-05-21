import { mockTicketMessageUserOrCustomer } from '@gorgias/helpdesk-mocks'
import type * as HelpdeskQueries from '@gorgias/helpdesk-queries'
import {
    useGetCustomer,
    useGetUserAvailability,
} from '@gorgias/helpdesk-queries'

import { render } from '../../../../tests/render.utils'
import { MessageAvatar } from '../MessageHeader/MessageAvatar'

vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueries>()

    return {
        ...actual,
        useGetCustomer: vi.fn(),
        useGetUserAvailability: vi.fn(),
    }
})

vi.mock('../../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(() => ({
        format: {
            relative: 'YYYY-MM-DD',
            compact: 'YYYY-MM-DD HH:mm',
        },
        timezone: undefined,
    })),
}))

const mockUseGetCustomer = vi.mocked(useGetCustomer)
const mockUseGetUserAvailability = vi.mocked(useGetUserAvailability)

const sender = mockTicketMessageUserOrCustomer({
    id: 123,
    name: 'Alice Customer',
    email: 'alice@example.com',
})

beforeEach(() => {
    mockUseGetCustomer.mockReturnValue({ data: undefined } as ReturnType<
        typeof useGetCustomer
    >)
    mockUseGetUserAvailability.mockReturnValue({
        data: undefined,
    } as ReturnType<typeof useGetUserAvailability>)
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

    it('uses the agent availability endpoint for agent avatars', () => {
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
        expect(mockUseGetUserAvailability).toHaveBeenCalledWith(
            sender.id,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                }),
            }),
        )
    })
})
