import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import {
    mockGetViewHandler,
    mockGetViewResponse,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../tests/render.utils'
import { useCreateTicketDraft } from '../useCreateTicketDraft'
import { ViewHeader } from '../ViewHeader'

vi.mock('../useCreateTicketDraft')
const useCreateTicketDraftMock = vi.mocked(useCreateTicketDraft)

const viewId = 123
const viewName = 'Test Support Queue'

const mockGetView = mockGetViewHandler(async () =>
    HttpResponse.json(mockGetViewResponse({ id: viewId, name: viewName })),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(mockGetView.handler)
    useCreateTicketDraftMock.mockReturnValue({
        hasDraft: false,
        onCreateTicket: vi.fn(),
        onResumeDraft: vi.fn(),
        onDiscardDraft: vi.fn(),
    })
})

afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('ViewHeader', () => {
    it('renders the view name from the API', async () => {
        render(<ViewHeader viewId={viewId} />)
        await waitFor(() => {
            expect(screen.getByText(viewName)).toBeInTheDocument()
        })
    })

    it('calls onExpand when the "Show ticket panel" button is clicked', async () => {
        const onExpand = vi.fn()
        const { user } = render(
            <ViewHeader viewId={viewId} onExpand={onExpand} />,
        )
        await user.click(
            screen.getByRole('button', { name: /show ticket panel/i }),
        )
        expect(onExpand).toHaveBeenCalledTimes(1)
    })

    describe('when no draft exists', () => {
        it('renders a plain "Create ticket" button', () => {
            render(<ViewHeader viewId={viewId} />)
            expect(
                screen.getByRole('button', { name: /create ticket/i }),
            ).toBeInTheDocument()
        })

        it('calls onCreateTicket when the button is clicked', async () => {
            const onCreateTicket = vi.fn()
            useCreateTicketDraftMock.mockReturnValue({
                hasDraft: false,
                onCreateTicket,
                onResumeDraft: vi.fn(),
                onDiscardDraft: vi.fn(),
            })
            const { user } = render(<ViewHeader viewId={viewId} />)
            await user.click(
                screen.getByRole('button', { name: /create ticket/i }),
            )
            expect(onCreateTicket).toHaveBeenCalledTimes(1)
        })
    })

    describe('when a draft exists', () => {
        beforeEach(() => {
            useCreateTicketDraftMock.mockReturnValue({
                hasDraft: true,
                onCreateTicket: vi.fn(),
                onResumeDraft: vi.fn(),
                onDiscardDraft: vi.fn(),
            })
        })

        it('opens the draft menu when "Create ticket" is clicked', async () => {
            const { user } = render(<ViewHeader viewId={viewId} />)
            await user.click(
                screen.getByRole('button', { name: /create ticket/i }),
            )
            expect(
                await screen.findByRole('menuitem', { name: /resume draft/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', {
                    name: /discard and create new ticket/i,
                }),
            ).toBeInTheDocument()
        })

        it.each([
            { label: /resume draft/i, action: 'onResumeDraft' as const },
            {
                label: /discard and create new ticket/i,
                action: 'onDiscardDraft' as const,
            },
        ])(
            'calls $action when "$label" menu item is clicked',
            async ({ label, action }) => {
                const handler = vi.fn()
                useCreateTicketDraftMock.mockReturnValue({
                    hasDraft: true,
                    onCreateTicket: vi.fn(),
                    onResumeDraft: vi.fn(),
                    onDiscardDraft: vi.fn(),
                    [action]: handler,
                })
                const { user } = render(<ViewHeader viewId={viewId} />)
                await user.click(
                    screen.getByRole('button', { name: /create ticket/i }),
                )
                await user.click(
                    await screen.findByRole('menuitem', { name: label }),
                )
                expect(handler).toHaveBeenCalledTimes(1)
            },
        )
    })
})
