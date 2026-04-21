import React from 'react'

import { cleanup, screen, waitFor } from '@testing-library/react'
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

import { render } from '../../tests/render.utils'
import { useCreateTicketDraft } from '../useCreateTicketDraft'
import { ViewHeader } from '../ViewHeader'

vi.mock('../useCreateTicketDraft')
const useCreateTicketDraftMock = vi.mocked(useCreateTicketDraft)

const viewId = 123
const viewName = 'Test Support Queue'

const mockGetView = mockGetViewHandler(async () =>
    HttpResponse.json(
        mockGetViewResponse({
            decoration: null,
            id: viewId,
            name: viewName,
        }),
    ),
)

const server = setupServer()

const renderViewHeader = (
    props: Partial<React.ComponentProps<typeof ViewHeader>> = {},
    options?: {
        loadTitleFromApi?: boolean
    },
) => {
    const { loadTitleFromApi = false } = options ?? {}

    const titleOverride =
        !loadTitleFromApi &&
        props.titleOverride === undefined &&
        !props.isDraftView
            ? viewName
            : props.titleOverride

    return render(
        <ViewHeader
            viewId={props.viewId ?? viewId}
            {...props}
            titleOverride={titleOverride}
        />,
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockGetView.handler)
    useCreateTicketDraftMock.mockReturnValue({
        hasDraft: false,
        onCreateTicket: vi.fn(),
        onResumeDraft: vi.fn(),
        onDiscardDraft: vi.fn(),
    })
})

afterEach(async () => {
    cleanup()
    server.resetHandlers()
    vi.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('ViewHeader', () => {
    it('renders the view name from the API', async () => {
        renderViewHeader({}, { loadTitleFromApi: true })
        await waitFor(() => {
            expect(screen.getByText(viewName)).toBeInTheDocument()
        })
    })

    it('renders the view emoji from the API when available', async () => {
        const mockEmojiView = mockGetViewHandler(async () =>
            HttpResponse.json(
                mockGetViewResponse({
                    id: viewId,
                    name: viewName,
                    decoration: { emoji: '✨' },
                }),
            ),
        )

        server.resetHandlers()
        server.use(mockEmojiView.handler)

        renderViewHeader({}, { loadTitleFromApi: true })

        await waitFor(() => {
            expect(screen.getByText(`✨ ${viewName}`)).toBeInTheDocument()
        })
    })

    it('renders the draft title override when provided', () => {
        renderViewHeader({ titleOverride: 'New view' })

        expect(screen.getByText('New view')).toBeInTheDocument()
    })

    it('calls onExpand when the "Show ticket panel" button is clicked', async () => {
        const onExpand = vi.fn()
        const { user } = renderViewHeader({ onExpand })
        await user.click(
            screen.getByRole('button', { name: /show ticket panel/i }),
        )
        expect(onExpand).toHaveBeenCalledTimes(1)
    })

    it('hides the view controls that do not apply to draft views', () => {
        renderViewHeader({ isDraftView: true, titleOverride: 'New view' })

        expect(
            screen.queryByRole('button', { name: /show ticket panel/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /edit view/i }),
        ).not.toBeInTheDocument()
    })

    it('hides the split-view toggle and view actions in search mode', () => {
        render(<ViewHeader viewId={viewId} isSearchMode />)

        expect(
            screen.queryByRole('button', { name: /show ticket panel/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /edit view/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /create ticket/i }),
        ).not.toBeInTheDocument()
    })

    it('calls onEditView when the "Edit view" button is clicked', async () => {
        const onEditView = vi.fn()
        const { user } = renderViewHeader({ onEditView })
        await user.click(screen.getByRole('button', { name: /edit view/i }))
        expect(onEditView).toHaveBeenCalledTimes(1)
    })

    describe('when no draft exists', () => {
        it('renders a plain "Create ticket" button', () => {
            renderViewHeader()
            expect(
                screen.getByRole('button', { name: /create ticket/i }),
            ).toBeInTheDocument()
        })

        it('hides the create ticket button when requested', () => {
            renderViewHeader({ hideCreateTicket: true })

            expect(
                screen.queryByRole('button', { name: /create ticket/i }),
            ).not.toBeInTheDocument()
        })

        it('calls onCreateTicket when the button is clicked', async () => {
            const onCreateTicket = vi.fn()
            useCreateTicketDraftMock.mockReturnValue({
                hasDraft: false,
                onCreateTicket,
                onResumeDraft: vi.fn(),
                onDiscardDraft: vi.fn(),
            })
            const { user } = renderViewHeader()
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
            const { user } = renderViewHeader()
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
                const { user } = renderViewHeader()
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
