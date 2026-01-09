import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockTicket, mockUpdateTicketHandler } from '@gorgias/helpdesk-mocks'
import { TicketPriority as TicketPriorityType } from '@gorgias/helpdesk-queries'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { TicketPriority } from '../TicketPriority'

const ticketId = 123

const mockUpdateTicket = mockUpdateTicketHandler(async () => {
    return HttpResponse.json(
        mockTicket({
            id: ticketId,
            priority: TicketPriorityType.High,
        }),
    )
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockUpdateTicket.handler)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const waitUntilLoaded = async () => {
    let selectElement: HTMLElement = {} as HTMLElement
    await waitFor(() => {
        const select = screen.getAllByLabelText('Priority selection')
        expect(select[0]).not.toBeDisabled()
        selectElement = select[0]
    })
    return selectElement
}

describe('TicketPriority', () => {
    it('should render with "Normal" placeholder when no priority is provided', () => {
        render(
            <TicketPriority ticketId={ticketId} currentPriority={undefined} />,
        )

        const normalTexts = screen.getAllByText('Normal')
        expect(normalTexts.length).toBeGreaterThan(0)
    })

    it.each([
        { priority: TicketPriorityType.High, expectedText: 'High' },
        { priority: TicketPriorityType.Critical, expectedText: 'Critical' },
        { priority: TicketPriorityType.Low, expectedText: 'Low' },
    ])(
        'should render with "$expectedText" label when priority is $priority',
        ({ priority, expectedText }) => {
            render(
                <TicketPriority
                    ticketId={ticketId}
                    currentPriority={priority}
                />,
            )

            const texts = screen.getAllByText(expectedText)
            expect(texts.length).toBeGreaterThan(0)
        },
    )

    it('should update priority when selecting a priority', async () => {
        const waitForUpdateTicketRequest =
            mockUpdateTicket.waitForRequest(server)

        const { user } = render(
            <TicketPriority
                ticketId={ticketId}
                currentPriority={TicketPriorityType.Normal}
            />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        const highOptions = await screen.findAllByText('High')
        await act(async () => {
            await user.click(highOptions[highOptions.length - 1])
        })

        await waitForUpdateTicketRequest(async (request) => {
            const body = await request.clone().json()
            expect(body).toEqual({
                priority: TicketPriorityType.High,
            })
        })
    })

    it('should disable trigger while updating priority', async () => {
        const mockUpdateTicketSlow = mockUpdateTicketHandler(
            async () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve(
                                HttpResponse.json(
                                    mockTicket({
                                        id: ticketId,
                                        priority: TicketPriorityType.High,
                                    }),
                                ),
                            ),
                        100,
                    ),
                ),
        )

        server.use(mockUpdateTicketSlow.handler)

        const { user } = render(
            <TicketPriority
                ticketId={ticketId}
                currentPriority={TicketPriorityType.Normal}
            />,
        )

        const select = await waitUntilLoaded()
        expect(select).not.toBeDisabled()

        await act(async () => {
            await user.click(select)
        })

        const highOptions = await screen.findAllByText('High')
        await act(async () => {
            await user.click(highOptions[highOptions.length - 1])
        })

        await waitFor(() => {
            expect(select).toBeDisabled()
        })

        await waitFor(() => {
            expect(select).not.toBeDisabled()
        })
    })
})
