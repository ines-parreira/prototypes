import { render, screen } from '@testing-library/react'
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
})
