import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionImpact } from './KnowledgeEditorSidePanelSectionImpact'

describe('KnowledgeEditorSidePanelSectionImpact', () => {
    it('renders with metric values', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                <KnowledgeEditorSidePanelSectionImpact
                    tickets={{ value: 42 }}
                    handoverTickets={{ value: 5 }}
                    csat={{ value: 4.2 }}
                    intents={['Order/status', 'Shipping/inquiry']}
                    sectionId="impact"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('Tickets')).toBeInTheDocument()
        expect(screen.getByText('42')).toBeInTheDocument()
        expect(screen.getByText('Handover tickets')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('CSAT')).toBeInTheDocument()
        expect(screen.getByText('4.2')).toBeInTheDocument()
        expect(screen.getByText('Intents')).toBeInTheDocument()
        expect(screen.getByText('order/status')).toBeInTheDocument()
        expect(screen.getByText('shipping/inquiry')).toBeInTheDocument()
    })

    it('renders with loading state', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                <KnowledgeEditorSidePanelSectionImpact
                    tickets={{ value: 42 }}
                    handoverTickets={{ value: 5 }}
                    csat={{ value: 4.2 }}
                    intents={['Order/status']}
                    isLoading={true}
                    sectionId="impact"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Impact')).toBeInTheDocument()
    })

    it('renders with missing values', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                <KnowledgeEditorSidePanelSectionImpact sectionId="impact" />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Impact')).toBeInTheDocument()
        const dashes = screen.getAllByText('-')
        expect(dashes.length).toBe(4)
    })

    it('renders with empty intents array', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                <KnowledgeEditorSidePanelSectionImpact
                    tickets={{ value: 10 }}
                    handoverTickets={{ value: 2 }}
                    csat={{ value: 3.5 }}
                    intents={[]}
                    sectionId="impact"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3.5')).toBeInTheDocument()
    })

    it('should call onClick when metric is clicked', async () => {
        const onTicketsClick = jest.fn()
        const user = userEvent.setup()

        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                <KnowledgeEditorSidePanelSectionImpact
                    tickets={{ value: 100, onClick: onTicketsClick }}
                    sectionId="impact"
                />
            </KnowledgeEditorSidePanel>,
        )

        const ticketsLink = screen.getByRole('link', { name: '100' })
        await user.click(ticketsLink)

        expect(onTicketsClick).toHaveBeenCalledTimes(1)
    })

    describe('expandable intents section', () => {
        it('should not show View All button when intents count is 3 or less', () => {
            render(
                <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                    <KnowledgeEditorSidePanelSectionImpact
                        intents={[
                            'Order/status',
                            'Shipping/inquiry',
                            'Product/info',
                        ]}
                        sectionId="impact"
                    />
                </KnowledgeEditorSidePanel>,
            )

            expect(screen.getByText('order/status')).toBeInTheDocument()
            expect(screen.getByText('shipping/inquiry')).toBeInTheDocument()
            expect(screen.getByText('product/info')).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /view all/i }),
            ).not.toBeInTheDocument()
        })

        it('should show only 3 intents initially and View All button when there are more than 3', () => {
            render(
                <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                    <KnowledgeEditorSidePanelSectionImpact
                        intents={[
                            'Order/status',
                            'Shipping/inquiry',
                            'Product/info',
                            'Return/refund',
                            'Payment/issue',
                        ]}
                        sectionId="impact"
                    />
                </KnowledgeEditorSidePanel>,
            )

            expect(screen.getByText('order/status')).toBeInTheDocument()
            expect(screen.getByText('shipping/inquiry')).toBeInTheDocument()
            expect(screen.getByText('product/info')).toBeInTheDocument()
            expect(screen.queryByText('return/refund')).not.toBeInTheDocument()
            expect(screen.queryByText('payment/issue')).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /view all/i }),
            ).toBeInTheDocument()
        })

        it('should expand to show all intents when View All is clicked', async () => {
            const user = userEvent.setup()

            render(
                <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                    <KnowledgeEditorSidePanelSectionImpact
                        intents={[
                            'Order/status',
                            'Shipping/inquiry',
                            'Product/info',
                            'Return/refund',
                            'Payment/issue',
                        ]}
                        sectionId="impact"
                    />
                </KnowledgeEditorSidePanel>,
            )

            const viewAllButton = screen.getByRole('button', {
                name: /view all/i,
            })
            await act(() => user.click(viewAllButton))

            expect(screen.getByText('order/status')).toBeInTheDocument()
            expect(screen.getByText('shipping/inquiry')).toBeInTheDocument()
            expect(screen.getByText('product/info')).toBeInTheDocument()
            expect(screen.getByText('return/refund')).toBeInTheDocument()
            expect(screen.getByText('payment/issue')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /view less/i }),
            ).toBeInTheDocument()
        })

        it('should collapse to show only 3 intents when View Less is clicked', async () => {
            const user = userEvent.setup()

            render(
                <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                    <KnowledgeEditorSidePanelSectionImpact
                        intents={[
                            'Order/status',
                            'Shipping/inquiry',
                            'Product/info',
                            'Return/refund',
                            'Payment/issue',
                        ]}
                        sectionId="impact"
                    />
                </KnowledgeEditorSidePanel>,
            )

            const viewAllButton = screen.getByRole('button', {
                name: /view all/i,
            })
            await act(() => user.click(viewAllButton))

            const viewLessButton = screen.getByRole('button', {
                name: /view less/i,
            })
            await act(() => user.click(viewLessButton))

            expect(screen.getByText('order/status')).toBeInTheDocument()
            expect(screen.getByText('shipping/inquiry')).toBeInTheDocument()
            expect(screen.getByText('product/info')).toBeInTheDocument()
            expect(screen.queryByText('return/refund')).not.toBeInTheDocument()
            expect(screen.queryByText('payment/issue')).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /view all/i }),
            ).toBeInTheDocument()
        })

        it('should not show View All button during loading state', () => {
            render(
                <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                    <KnowledgeEditorSidePanelSectionImpact
                        intents={[
                            'Order/status',
                            'Shipping/inquiry',
                            'Product/info',
                            'Return/refund',
                        ]}
                        isLoading={true}
                        sectionId="impact"
                    />
                </KnowledgeEditorSidePanel>,
            )

            expect(
                screen.queryByRole('button', { name: /view all/i }),
            ).not.toBeInTheDocument()
        })

        it('should not show View All button with empty intents array', () => {
            render(
                <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                    <KnowledgeEditorSidePanelSectionImpact
                        intents={[]}
                        sectionId="impact"
                    />
                </KnowledgeEditorSidePanel>,
            )

            expect(
                screen.queryByRole('button', { name: /view all/i }),
            ).not.toBeInTheDocument()
        })
    })
})
