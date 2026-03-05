import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { OrderMetafieldsSection } from './OrderMetafieldsSection'

const DEFINITIONS_URL =
    '/api/integrations/shopify/:integrationId/metafield-definitions'

function mockDefinitionsHandler(definitions: object[]) {
    return http.get(DEFINITIONS_URL, () =>
        HttpResponse.json({ data: definitions, meta: {} }),
    )
}

const server = setupServer(mockDefinitionsHandler([]))

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const defaultProps = { integrationId: 1, metafields: [] }

describe('OrderMetafieldsSection', () => {
    it('renders nothing when there is no integrationId', () => {
        const { container } = render(<OrderMetafieldsSection metafields={[]} />)

        expect(container.firstChild).toBeNull()
    })

    it('renders nothing when metafields is empty', async () => {
        const { container } = render(
            <OrderMetafieldsSection {...defaultProps} />,
        )

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })

    it('renders nothing when metafield has no matching definition', async () => {
        const { container } = render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        namespace: 'custom',
                        key: 'note',
                        type: 'single_line_text_field',
                        value: 'hello',
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })
})

describe('OrderMetafieldsSection — type rendering', () => {
    it('renders single_line_text_field as text', async () => {
        server.use(mockDefinitionsHandler([{ key: 'note', name: 'Note' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'note',
                        type: 'single_line_text_field',
                        value: 'Handle with care',
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Handle with care')).toBeInTheDocument()
        })
    })

    it('renders boolean true as a "true" tag', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'is_gift', name: 'Is Gift' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[{ key: 'is_gift', type: 'boolean', value: true }]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('true')).toBeInTheDocument()
        })
    })

    it('renders boolean false as a "false" tag', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'is_gift', name: 'Is Gift' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[{ key: 'is_gift', type: 'boolean', value: false }]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('false')).toBeInTheDocument()
        })
    })

    it('renders url as a link with correct href', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'website', name: 'Website' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'website',
                        type: 'url',
                        value: 'https://example.com',
                    },
                ]}
            />,
        )

        await waitFor(() => {
            const link = screen.getByRole('link', {
                name: 'https://example.com',
            })
            expect(link).toHaveAttribute('href', 'https://example.com')
            expect(link).toHaveAttribute('target', '_blank')
        })
    })

    it('renders color as its hex value', async () => {
        server.use(
            mockDefinitionsHandler([
                { key: 'brand_color', name: 'Brand Color' },
            ]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    { key: 'brand_color', type: 'color', value: '#FF5733' },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('#FF5733')).toBeInTheDocument()
        })
    })

    it('renders money as "amount currency_code"', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'discount', name: 'Discount' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'discount',
                        type: 'money',
                        value: { amount: '10.00', currency_code: 'USD' },
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('10.00 USD')).toBeInTheDocument()
        })
    })

    it('renders rating as "X out of Y"', async () => {
        server.use(mockDefinitionsHandler([{ key: 'score', name: 'Score' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'score',
                        type: 'rating',
                        value: { value: '4', scale_min: '1', scale_max: '5' },
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('4 out of 5')).toBeInTheDocument()
        })
    })

    it('renders dimension as "value unit"', async () => {
        server.use(mockDefinitionsHandler([{ key: 'width', name: 'Width' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'width',
                        type: 'dimension',
                        value: { value: '30', unit: 'cm' },
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('30 cm')).toBeInTheDocument()
        })
    })

    it('renders date as a formatted date, not the raw ISO string', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'event_date', name: 'Event Date' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    { key: 'event_date', type: 'date', value: '2024-01-15' },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByText('2024-01-15')).not.toBeInTheDocument()
            expect(screen.getByText(/2024/)).toBeInTheDocument()
        })
    })

    it('renders date_time as a formatted date and time, not the raw ISO string', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'event_time', name: 'Event Time' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'event_time',
                        type: 'date_time',
                        value: '2024-06-20T14:30:00Z',
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(
                screen.queryByText('2024-06-20T14:30:00Z'),
            ).not.toBeInTheDocument()
            expect(screen.getByText(/2024/)).toBeInTheDocument()
        })
    })

    it('renders number_integer as plain text', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'quantity', name: 'Quantity' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    { key: 'quantity', type: 'number_integer', value: 42 },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('42')).toBeInTheDocument()
        })
    })

    it('renders json as a formatted JSON string', async () => {
        server.use(mockDefinitionsHandler([{ key: 'config', name: 'Config' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'config',
                        type: 'json',
                        value: { enabled: true, limit: 5 },
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText(/"enabled": true/)).toBeInTheDocument()
        })
    })

    it('renders list.single_line_text_field as multiple text items', async () => {
        server.use(mockDefinitionsHandler([{ key: 'tags', name: 'Tags' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'tags',
                        type: 'list.single_line_text_field',
                        value: ['Red', 'Blue', 'Green'],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Red')).toBeInTheDocument()
            expect(screen.getByText('Blue')).toBeInTheDocument()
            expect(screen.getByText('Green')).toBeInTheDocument()
        })
    })

    it('renders list.url items as individual links', async () => {
        server.use(mockDefinitionsHandler([{ key: 'links', name: 'Links' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'links',
                        type: 'list.url',
                        value: ['https://example.com', 'https://example.org'],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: 'https://example.com' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'https://example.org' }),
            ).toBeInTheDocument()
        })
    })

    it('renders list.rating items as "X out of Y"', async () => {
        server.use(mockDefinitionsHandler([{ key: 'scores', name: 'Scores' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'scores',
                        type: 'list.rating',
                        value: [
                            { value: '3', scale_min: '1', scale_max: '5' },
                            { value: '5', scale_min: '1', scale_max: '5' },
                        ],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('3 out of 5')).toBeInTheDocument()
            expect(screen.getByText('5 out of 5')).toBeInTheDocument()
        })
    })

    it('renders list.date items as formatted dates', async () => {
        server.use(mockDefinitionsHandler([{ key: 'dates', name: 'Dates' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'dates',
                        type: 'list.date',
                        value: ['2024-01-15', '2024-06-20'],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByText('2024-01-15')).not.toBeInTheDocument()
            expect(screen.queryByText('2024-06-20')).not.toBeInTheDocument()
            expect(screen.getAllByText(/2024/).length).toBeGreaterThanOrEqual(2)
        })
    })

    it('renders list.date_time items as formatted dates and times', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'timestamps', name: 'Timestamps' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'timestamps',
                        type: 'list.date_time',
                        value: ['2024-01-15T10:00:00Z', '2024-06-20T14:30:00Z'],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(
                screen.queryByText('2024-01-15T10:00:00Z'),
            ).not.toBeInTheDocument()
            expect(screen.getAllByText(/2024/).length).toBeGreaterThanOrEqual(2)
        })
    })

    it('renders list.color items as individual hex values', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'palette', name: 'Palette' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'palette',
                        type: 'list.color',
                        value: ['#FF0000', '#00FF00'],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('#FF0000')).toBeInTheDocument()
            expect(screen.getByText('#00FF00')).toBeInTheDocument()
        })
    })

    it('renders list.number_integer items as plain text', async () => {
        server.use(
            mockDefinitionsHandler([{ key: 'quantities', name: 'Quantities' }]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'quantities',
                        type: 'list.number_integer',
                        value: [1, 2, 3],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
            expect(screen.getByText('3')).toBeInTheDocument()
        })
    })

    it('renders list.dimension items as "value unit"', async () => {
        server.use(mockDefinitionsHandler([{ key: 'sizes', name: 'Sizes' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'sizes',
                        type: 'list.dimension',
                        value: [
                            { value: '10', unit: 'cm' },
                            { value: '20', unit: 'cm' },
                        ],
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('10 cm')).toBeInTheDocument()
            expect(screen.getByText('20 cm')).toBeInTheDocument()
        })
    })

    it('renders multiple metafields together', async () => {
        server.use(
            mockDefinitionsHandler([
                { key: 'note', name: 'Note' },
                { key: 'price', name: 'Price' },
            ]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        key: 'note',
                        type: 'single_line_text_field',
                        value: 'VIP',
                    },
                    {
                        key: 'price',
                        type: 'money',
                        value: { amount: '99.00', currency_code: 'EUR' },
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
            expect(screen.getByText('99.00 EUR')).toBeInTheDocument()
        })
    })
})

describe('OrderMetafieldsSection — label resolution', () => {
    it('uses the definition name as label when available', async () => {
        server.use(
            mockDefinitionsHandler([
                { namespace: 'custom', key: 'order_note', name: 'Order Note' },
            ]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        namespace: 'custom',
                        key: 'order_note',
                        type: 'single_line_text_field',
                        value: 'Fragile',
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Order Note')).toBeInTheDocument()
            expect(
                screen.queryByText('custom.order_note'),
            ).not.toBeInTheDocument()
        })
    })

    it('falls back to namespace.key when definition has no name', async () => {
        server.use(
            mockDefinitionsHandler([
                { namespace: 'custom', key: 'order_note' },
            ]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        namespace: 'custom',
                        key: 'order_note',
                        type: 'single_line_text_field',
                        value: 'Fragile',
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('custom.order_note')).toBeInTheDocument()
        })
    })

    it('falls back to key only when namespace is absent and definition has no name', async () => {
        server.use(mockDefinitionsHandler([{ key: 'gift' }]))

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[{ key: 'gift', type: 'boolean', value: true }]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('gift')).toBeInTheDocument()
        })
    })

    it('only shows metafields that have a matching definition', async () => {
        server.use(
            mockDefinitionsHandler([
                { namespace: 'custom', key: 'pinned', name: 'Pinned Field' },
            ]),
        )

        render(
            <OrderMetafieldsSection
                {...defaultProps}
                metafields={[
                    {
                        namespace: 'custom',
                        key: 'pinned',
                        type: 'single_line_text_field',
                        value: 'Visible',
                    },
                    {
                        namespace: 'custom',
                        key: 'unpinned',
                        type: 'single_line_text_field',
                        value: 'Hidden',
                    },
                ]}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Visible')).toBeInTheDocument()
            expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
        })
    })
})
