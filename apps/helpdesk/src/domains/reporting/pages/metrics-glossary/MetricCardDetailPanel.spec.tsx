import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetMetricCardHandler,
    mockMetricCard,
    mockMetricCardPublic,
} from '@gorgias/helpdesk-mocks'

import { MetricCardDetailPanel } from 'domains/reporting/pages/metrics-glossary/MetricCardDetailPanel'

const card = mockMetricCard({
    slug: 'first-response-time',
    title: 'First response time (FRT)',
    public: mockMetricCardPublic({
        definition:
            'Time taken from when a customer submits a ticket until the first response is sent.',
        formula: 'Ticket closed timestamp − Ticket creation timestamp',
        computation_logic: [
            'Computed per ticket in business or calendar hours.',
            'Aggregated as median for reporting.',
        ],
    }),
})

const server = setupServer()

const noop = () => {}

const renderPanel = (
    props: Partial<React.ComponentProps<typeof MetricCardDetailPanel>> = {},
) =>
    render(
        <MetricCardDetailPanel
            slug={card.slug}
            isOpen
            onOpenChange={noop}
            {...props}
        />,
    )

describe('MetricCardDetailPanel', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

    beforeEach(() => {
        server.use(
            mockGetMetricCardHandler(async () => HttpResponse.json(card))
                .handler,
        )
    })

    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('renders the metric definition, formula and computation logic for the given slug', async () => {
        renderPanel()

        expect(
            await screen.findByText('First response time (FRT)'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Time taken from when a customer submits a ticket until the first response is sent.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Ticket closed timestamp − Ticket creation timestamp',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Computed per ticket in business or calendar hours\./,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Aggregated as median for reporting\./),
        ).toBeInTheDocument()
        expect(screen.getByText('Give feedback')).toBeInTheDocument()
    })

    it('shows loading skeletons until the card has loaded', async () => {
        server.use(
            mockGetMetricCardHandler(async () => {
                await delay()
                return HttpResponse.json(card)
            }).handler,
        )

        renderPanel()

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)

        expect(
            await screen.findByText('First response time (FRT)'),
        ).toBeInTheDocument()
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    it('does not render the metric content when closed without a slug', () => {
        renderPanel({ slug: null, isOpen: false })

        expect(
            screen.queryByText('First response time (FRT)'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'Ticket closed timestamp − Ticket creation timestamp',
            ),
        ).not.toBeInTheDocument()
    })

    it('calls onOpenChange when the panel is dismissed', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderPanel({ onOpenChange })

        await screen.findByText('First response time (FRT)')

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false)
        })
    })
})
