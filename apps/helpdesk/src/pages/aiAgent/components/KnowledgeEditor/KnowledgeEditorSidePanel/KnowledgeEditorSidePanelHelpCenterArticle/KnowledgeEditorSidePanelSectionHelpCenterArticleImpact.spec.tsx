import '@testing-library/jest-dom'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Accordion } from 'components/Accordion/Accordion'

import {
    KnowledgeEditorSidePanelSectionHelpCenterArticleImpact,
    Props,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleImpact'

const defaultProps: Props = {
    sectionId: 'impact',
}

const renderComponent = (props: Partial<Props> = {}) => {
    return render(
        <Accordion.Root value={['impact']}>
            <KnowledgeEditorSidePanelSectionHelpCenterArticleImpact
                {...defaultProps}
                {...props}
            />
        </Accordion.Root>,
    )
}

describe('KnowledgeEditorSidePanelSectionHelpCenterArticleImpact', () => {
    describe('Header', () => {
        it('should render header with title', () => {
            renderComponent()

            expect(screen.getByText('Impact')).toBeInTheDocument()
        })

        it('should render header with subtitle', () => {
            renderComponent()

            expect(screen.getByText('Last 28 days')).toBeInTheDocument()
        })

        it('should render tooltip with performance information on hover', async () => {
            const user = userEvent.setup()
            renderComponent()

            const infoIcon = screen.getByText('info')
            await act(() => user.hover(infoIcon))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Performance in tickets where this knowledge was used by AI Agent.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Metrics rendering', () => {
        it('should render all metrics with values', () => {
            renderComponent({
                tickets: { value: 100 },
                handoverTickets: { value: 25 },
                csat: { value: 4.3 },
            })

            expect(screen.getByText('100')).toBeInTheDocument()
            expect(screen.getByText('25')).toBeInTheDocument()
            expect(screen.getByText('4.3')).toBeInTheDocument()
        })

        it('should render metric labels', () => {
            renderComponent()

            expect(screen.getByText('Tickets')).toBeInTheDocument()
            expect(screen.getByText('Handover tickets')).toBeInTheDocument()
            expect(screen.getByText('CSAT')).toBeInTheDocument()
            expect(screen.getByText('Intents')).toBeInTheDocument()
        })

        it('should render dash for undefined metrics', () => {
            renderComponent({
                tickets: undefined,
                handoverTickets: undefined,
                csat: undefined,
            })

            expect(screen.getByText('Tickets')).toBeInTheDocument()
            const dashes = screen.getAllByText('-')
            expect(dashes.length).toBeGreaterThanOrEqual(3)
        })

        it('should render dash when metric value is undefined', () => {
            renderComponent({
                tickets: { value: undefined },
            })

            const rows = screen.getAllByRole('row')
            const ticketsRow = rows.find((row) =>
                row.textContent?.includes('Tickets'),
            )
            expect(ticketsRow?.textContent).toBe('Tickets-')
        })
    })

    describe('Clickable metrics', () => {
        it('should render clickable link when metric has onClick handler', () => {
            const mockOnClick = jest.fn()
            renderComponent({
                tickets: { value: 100, onClick: mockOnClick },
            })

            const link = screen.getByRole('link', { name: '100' })
            expect(link).toBeInTheDocument()
        })

        it('should call onClick handler when clickable metric is clicked', async () => {
            const user = userEvent.setup()
            const mockOnClick = jest.fn()
            renderComponent({
                tickets: { value: 100, onClick: mockOnClick },
            })

            const link = screen.getByRole('link', { name: '100' })
            await act(() => user.click(link))

            expect(mockOnClick).toHaveBeenCalledTimes(1)
        })

        it('should prevent default navigation when link is clicked', async () => {
            const mockOnClick = jest.fn()
            renderComponent({
                tickets: { value: 100, onClick: mockOnClick },
            })

            const link = screen.getByRole('link', { name: '100' })
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            })
            const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault')

            link.dispatchEvent(clickEvent)

            expect(preventDefaultSpy).toHaveBeenCalled()
        })

        it('should call onClick handler when Enter key is pressed on link', async () => {
            const user = userEvent.setup()
            const mockOnClick = jest.fn()
            renderComponent({
                tickets: { value: 100, onClick: mockOnClick },
            })

            const link = screen.getByRole('link', { name: '100' })
            link.focus()
            await act(() => user.keyboard('{Enter}'))

            expect(mockOnClick).toHaveBeenCalledTimes(1)
        })

        it('should render non-clickable text when metric has no onClick handler', () => {
            renderComponent({
                tickets: { value: 100 },
            })

            expect(screen.getByText('100')).toBeInTheDocument()
            expect(
                screen.queryByRole('link', { name: '100' }),
            ).not.toBeInTheDocument()
        })

        it('should make multiple metrics clickable independently', async () => {
            const user = userEvent.setup()
            const mockTicketsClick = jest.fn()
            const mockHandoverClick = jest.fn()
            const mockCsatClick = jest.fn()

            renderComponent({
                tickets: { value: 100, onClick: mockTicketsClick },
                handoverTickets: { value: 25, onClick: mockHandoverClick },
                csat: { value: 4.5, onClick: mockCsatClick },
            })

            await act(() =>
                user.click(screen.getByRole('link', { name: '100' })),
            )
            expect(mockTicketsClick).toHaveBeenCalledTimes(1)
            expect(mockHandoverClick).not.toHaveBeenCalled()
            expect(mockCsatClick).not.toHaveBeenCalled()

            await act(() =>
                user.click(screen.getByRole('link', { name: '25' })),
            )
            expect(mockHandoverClick).toHaveBeenCalledTimes(1)
            expect(mockCsatClick).not.toHaveBeenCalled()

            await act(() =>
                user.click(screen.getByRole('link', { name: '4.5' })),
            )
            expect(mockCsatClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('Intents', () => {
        it('should render intents as chips', () => {
            renderComponent({
                intents: ['Order Status', 'Shipping', 'Returns'],
            })

            expect(screen.getByText('Order Status')).toBeInTheDocument()
            expect(screen.getByText('Shipping')).toBeInTheDocument()
            expect(screen.getByText('Returns')).toBeInTheDocument()
        })

        it('should render dash when intents array is empty', () => {
            renderComponent({
                intents: [],
            })

            const rows = screen.getAllByRole('row')
            const intentsRow = rows.find((row) =>
                row.textContent?.includes('Intents'),
            )
            expect(intentsRow?.textContent).toBe('Intents-')
        })

        it('should render dash when intents is undefined', () => {
            renderComponent({
                intents: undefined,
            })

            const rows = screen.getAllByRole('row')
            const intentsRow = rows.find((row) =>
                row.textContent?.includes('Intents'),
            )
            expect(intentsRow?.textContent).toBe('Intents-')
        })

        it('should render single intent', () => {
            renderComponent({
                intents: ['Order Status'],
            })

            expect(screen.getByText('Order Status')).toBeInTheDocument()
        })

        it('should render multiple intents', () => {
            renderComponent({
                intents: ['Intent 1', 'Intent 2', 'Intent 3', 'Intent 4'],
            })

            expect(screen.getByText('Intent 1')).toBeInTheDocument()
            expect(screen.getByText('Intent 2')).toBeInTheDocument()
            expect(screen.getByText('Intent 3')).toBeInTheDocument()
            expect(screen.getByText('Intent 4')).toBeInTheDocument()
        })
    })

    describe('Complete scenarios', () => {
        it('should render all data when fully populated', () => {
            const mockTicketsClick = jest.fn()
            renderComponent({
                tickets: { value: 150, onClick: mockTicketsClick },
                handoverTickets: { value: 30 },
                csat: { value: 4.7 },
                intents: ['Billing', 'Technical Support'],
            })

            expect(
                screen.getByRole('link', { name: '150' }),
            ).toBeInTheDocument()
            expect(screen.getByText('30')).toBeInTheDocument()
            expect(screen.getByText('4.7')).toBeInTheDocument()
            expect(screen.getByText('Billing')).toBeInTheDocument()
            expect(screen.getByText('Technical Support')).toBeInTheDocument()
        })

        it('should render section with no data', () => {
            renderComponent({
                tickets: undefined,
                handoverTickets: undefined,
                csat: undefined,
                intents: undefined,
            })

            expect(screen.getByText('Impact')).toBeInTheDocument()
            expect(screen.getByText('Tickets')).toBeInTheDocument()
            expect(screen.getByText('Handover tickets')).toBeInTheDocument()
            expect(screen.getByText('CSAT')).toBeInTheDocument()
            expect(screen.getByText('Intents')).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('should use table structure for metrics', () => {
            renderComponent({
                tickets: { value: 100 },
            })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should use proper table headers', () => {
            renderComponent()

            expect(
                screen.getByRole('rowheader', { name: 'Tickets' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('rowheader', { name: 'Handover tickets' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('rowheader', { name: 'CSAT' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('rowheader', { name: 'Intents' }),
            ).toBeInTheDocument()
        })
    })
})
