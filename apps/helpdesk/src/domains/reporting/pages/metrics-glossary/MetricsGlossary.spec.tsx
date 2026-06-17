import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetMetricCardHandler,
    mockMetricCard,
    mockMetricCardPublic,
    mockSearchMetricCardsHandler,
} from '@gorgias/helpdesk-mocks'

import { MetricsGlossary } from 'domains/reporting/pages/metrics-glossary/MetricsGlossary'

const frtCard = mockMetricCard({
    slug: 'first-response-time',
    title: 'First response time (FRT)',
    category: 'support-performance',
    status: 'published',
    used_in_reports: ['Performance / Overview'],
    definition_revised_at: '2020-01-15',
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

const csatCard = mockMetricCard({
    slug: 'average-csat',
    title: 'CSAT (Customer Satisfaction)',
    category: 'ai-and-automation',
    status: 'published',
    used_in_reports: ['AI & automation / Support', 'Performance / Overview'],
    definition_revised_at: '2020-02-20',
    public: mockMetricCardPublic({
        definition:
            'Based on satisfaction surveys sent after ticket resolution.',
    }),
})

// Category id with no entry in METRIC_CATEGORY_BY_ID, so getCategoryLabel
// falls back to the raw id for both the cell and the sort comparator.
const unmappedCard = mockMetricCard({
    slug: 'abandoned-calls',
    title: 'Mystery metric',
    category: 'zz-unmapped-category',
    status: 'published',
    used_in_reports: [],
    definition_revised_at: '2020-03-10',
    public: mockMetricCardPublic({
        definition: 'A metric whose category is not in the locked enum.',
    }),
})

const CARDS = [frtCard, csatCard]

const searchHandler = () =>
    mockSearchMetricCardsHandler(async ({ request }) => {
        const params = new URL(request.url).searchParams
        const q = params.get('q')?.toLowerCase()
        const category = params.get('category')

        let data = CARDS
        if (q) {
            data = data.filter(
                (card) =>
                    card.title.toLowerCase().includes(q) ||
                    card.public.definition.toLowerCase().includes(q),
            )
        }
        if (category) {
            data = data.filter((card) => card.category === category)
        }

        return HttpResponse.json({ data })
    })

const server = setupServer()

const renderPage = () => render(<MetricsGlossary />)

// Wait for the data to land via a cheap text query before resolving the row.
// `findByRole('row', { name })` recomputes the accessible name of every row on
// each poll, which is slow enough under CI load to time out before the table
// renders; gating on the title text first makes the row lookup deterministic.
const findFrtRow = async () => {
    await screen.findByText('First response time (FRT)')
    return screen.getByRole('row', { name: /First response time \(FRT\)/ })
}

describe('MetricsGlossary', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

    beforeEach(() => {
        server.use(
            searchHandler().handler,
            mockGetMetricCardHandler(async () => HttpResponse.json(frtCard))
                .handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
        // The table persists sort/filter state to localStorage; clear it so
        // each test starts from the default (unsorted) order.
        localStorage.clear()
    })
    afterAll(() => server.close())

    it('renders each metric with its definition, category, reports and last-updated date', async () => {
        renderPage()

        const frtRow = await findFrtRow()

        expect(
            within(frtRow).getByText(
                'Time taken from when a customer submits a ticket until the first response is sent.',
            ),
        ).toBeInTheDocument()
        expect(
            within(frtRow).getByText('Support performance'),
        ).toBeInTheDocument()
        expect(
            within(frtRow).getByText('Performance / Overview'),
        ).toBeInTheDocument()
        expect(within(frtRow).getByText('01/15/2020')).toBeInTheDocument()

        expect(
            await screen.findByRole('row', {
                name: /CSAT \(Customer Satisfaction\)/,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('AI & automation')).toBeInTheDocument()
    })

    it('sends the typed search to the q query param and shows only matching metrics', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('First response time (FRT)')

        await user.type(screen.getByPlaceholderText('Search...'), 'CSAT')

        // Once the q-filtered response lands, the non-matching metric is gone
        // while the matching one remains.
        await waitFor(() => {
            expect(
                screen.queryByText('First response time (FRT)'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText('CSAT (Customer Satisfaction)'),
            ).toBeInTheDocument()
        })
    })

    it('opens the detail side panel with the formula and computation when a row is clicked', async () => {
        const user = userEvent.setup()
        renderPage()

        const row = await findFrtRow()
        await user.click(row)

        expect(
            await screen.findByText(
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

    it('sorts rows by their category label (falling back to the raw id for unmapped categories) when the Category header is clicked', async () => {
        const user = userEvent.setup()
        server.use(
            mockSearchMetricCardsHandler(async () =>
                HttpResponse.json({ data: [frtCard, csatCard, unmappedCard] }),
            ).handler,
        )
        renderPage()

        const knownTitles = [
            'CSAT (Customer Satisfaction)',
            'First response time (FRT)',
            'Mystery metric',
        ]
        const rowOrder = () =>
            screen
                .getAllByRole('row')
                .map((row) =>
                    knownTitles.find((title) =>
                        row.textContent?.includes(title),
                    ),
                )
                .filter(Boolean)

        await screen.findByText('First response time (FRT)')

        // Default order mirrors the response order.
        expect(rowOrder()).toEqual([
            'First response time (FRT)',
            'CSAT (Customer Satisfaction)',
            'Mystery metric',
        ])

        await user.click(
            screen.getByRole('columnheader', { name: /Category/i }),
        )

        // Ascending by label: 'AI & automation' < 'Support performance' <
        // 'zz-unmapped-category' (the fallback raw id).
        await waitFor(() => {
            expect(rowOrder()).toEqual([
                'CSAT (Customer Satisfaction)',
                'First response time (FRT)',
                'Mystery metric',
            ])
        })

        // The unmapped category renders its raw id instead of a friendly label.
        expect(screen.getByText('zz-unmapped-category')).toBeInTheDocument()
    })

    it('closes the detail side panel when it is dismissed', async () => {
        const user = userEvent.setup()
        renderPage()

        const row = await findFrtRow()
        await user.click(row)

        expect(
            await screen.findByText(
                'Ticket closed timestamp − Ticket creation timestamp',
            ),
        ).toBeInTheDocument()

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Ticket closed timestamp − Ticket creation timestamp',
                ),
            ).not.toBeInTheDocument()
        })
    })

    it('shows an error toast when the metrics fail to load', async () => {
        server.use(
            mockSearchMetricCardsHandler(async () =>
                HttpResponse.json({ data: [] }, { status: 500 }),
            ).handler,
        )

        renderPage()

        expect(await screen.findByRole('status')).toHaveTextContent(
            'Failed to load the metrics glossary',
        )
    })
})
