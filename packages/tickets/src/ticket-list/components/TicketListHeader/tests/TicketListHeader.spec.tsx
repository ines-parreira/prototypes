import * as React from 'react'

import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetViewHandler,
    mockGetViewResponse,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { TicketListHeader } from '../TicketListHeader'

const viewId = 123
const viewName = 'My Support Queue'

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
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketListHeader', () => {
    it('renders the view name from the API', async () => {
        render(<TicketListHeader viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            expect(screen.getByText(viewName)).toBeInTheDocument()
        })
    })

    it('calls onCollapse when the hide ticket panel button is clicked', async () => {
        const onCollapse = vi.fn()
        const { user } = render(
            <TicketListHeader viewId={viewId} onCollapse={onCollapse} />,
        )

        await user.click(
            screen.getByRole('button', { name: /hide ticket panel/i }),
        )

        expect(onCollapse).toHaveBeenCalledTimes(1)
    })

    it.each([{ name: /sort view by/i }, { name: /edit view/i }])(
        'renders the "$name" button',
        ({ name }) => {
            render(<TicketListHeader viewId={viewId} onCollapse={vi.fn()} />)

            expect(screen.getByRole('button', { name })).toBeInTheDocument()
        },
    )
})
