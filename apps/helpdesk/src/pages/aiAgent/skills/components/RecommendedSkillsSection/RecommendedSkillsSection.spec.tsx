import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import { useIntentsMetrics } from 'pages/aiAgent/skills/hooks/useIntentsMetrics'
import { useTotalAiAgentTickets } from 'pages/aiAgent/skills/hooks/useTotalAiAgentTickets'
import { IntentStatus } from 'pages/aiAgent/skills/types'
import type { Intent, SkillTemplate } from 'pages/aiAgent/skills/types'

import { RecommendedSkillsSection } from './RecommendedSkillsSection'

jest.mock('pages/aiAgent/skills/hooks/useIntentsMetrics', () => ({
    useIntentsMetrics: jest.fn(),
}))
jest.mock('pages/aiAgent/skills/hooks/useTotalAiAgentTickets', () => ({
    useTotalAiAgentTickets: jest.fn(),
}))
const mockUseIntentsMetrics = useIntentsMetrics as jest.Mock
const mockUseTotalAiAgentTickets = useTotalAiAgentTickets as jest.Mock
const makeTemplate = (
    id: string,
    name: string,
    intentName: Intent['name'],
): SkillTemplate => ({
    id,
    name,
    guidanceId: `${id}-guidance`,
    intents: [
        {
            name: intentName,
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [],
        },
    ],
})
const mockTemplates: SkillTemplate[] = [
    makeTemplate('order-status', 'Order Status', 'order::status'),
    makeTemplate('order-cancel', 'Order Cancellations', 'order::cancel'),
    makeTemplate('returns', 'Returns and Exchanges', 'return::request'),
]
const renderComponent = (
    skillsTemplates = mockTemplates,
    onCreateSkillsFromTemplate = jest.fn(),
): ReturnType<typeof render> =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <RecommendedSkillsSection
                    skillsTemplates={skillsTemplates}
                    onCreateSkillsFromTemplate={onCreateSkillsFromTemplate}
                />
            </ThemeProvider>
        </AxiomProvider>,
        {},
    )
describe('RecommendedSkillsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
        })
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 0 })
    })
    it('renders the section heading', () => {
        renderComponent()
        expect(
            screen.getByRole('heading', { name: 'Recommended skills' }),
        ).toBeInTheDocument()
    })
    it('renders the description text', () => {
        renderComponent()
        expect(
            screen.getByText(
                'Based on your ticket volume, these skills will have the biggest impact.',
            ),
        ).toBeInTheDocument()
    })
    it('renders a card for each template', () => {
        renderComponent()
        expect(screen.getByText('Order Status')).toBeInTheDocument()
        expect(screen.getByText('Order Cancellations')).toBeInTheDocument()
        expect(screen.getByText('Returns and Exchanges')).toBeInTheDocument()
    })
    it('renders scroll left and right buttons', () => {
        renderComponent()
        expect(
            screen.getByRole('button', { name: 'Scroll left' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Scroll right' }),
        ).toBeInTheDocument()
    })
    it('scroll left button is disabled initially', () => {
        renderComponent()
        expect(
            screen.getByRole('button', { name: 'Scroll left' }),
        ).toBeDisabled()
    })
    it('shows loading skeletons for stats when metrics are loading', () => {
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map(),
            isLoading: true,
        })
        renderComponent()
        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })
    it('does not render any coverage label when no metrics are available', () => {
        renderComponent()
        expect(screen.queryByText(/Would cover/i)).not.toBeInTheDocument()
    })
    it('does not render any loading skeleton when no skill has coverage', () => {
        renderComponent()
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })
    it('calls onCreateSkillsFromTemplate with the template id when a card is clicked', async () => {
        const user = userEvent.setup()
        const onCreateSkillsFromTemplate = jest.fn()
        renderComponent(mockTemplates, onCreateSkillsFromTemplate)
        await user.click(screen.getByText('Order Status'))
        expect(onCreateSkillsFromTemplate).toHaveBeenCalledTimes(1)
        expect(onCreateSkillsFromTemplate).toHaveBeenCalledWith('order-status')
    })
    it('scroll right button is disabled initially', () => {
        renderComponent()
        expect(
            screen.getByRole('button', { name: 'Scroll right' }),
        ).toBeDisabled()
    })
    it('renders cards sorted by descending ticket volume', () => {
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map([
                [
                    'order::status',
                    {
                        ticketVolume: 50,
                        handoverCount: 0,
                        ticketVolumePercent: 17,
                        handoverPercent: 0,
                    },
                ],
                [
                    'return::request',
                    {
                        ticketVolume: 150,
                        handoverCount: 0,
                        ticketVolumePercent: 50,
                        handoverPercent: 0,
                    },
                ],
                [
                    'order::cancel',
                    {
                        ticketVolume: 100,
                        handoverCount: 0,
                        ticketVolumePercent: 33,
                        handoverPercent: 0,
                    },
                ],
            ]),
            isLoading: false,
        })
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 300 })
        renderComponent()
        const orderStatus = screen.getByText('Order Status')
        const orderCancel = screen.getByText('Order Cancellations')
        const returns = screen.getByText('Returns and Exchanges')
        expect(
            returns.compareDocumentPosition(orderCancel) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
        expect(
            orderCancel.compareDocumentPosition(orderStatus) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
    })
    it('displays the coverage label computed from metrics data', () => {
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map([
                [
                    'order::status',
                    {
                        ticketVolume: 200,
                        handoverCount: 0,
                        ticketVolumePercent: 50,
                        handoverPercent: 0,
                    },
                ],
            ]),
            isLoading: false,
        })
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 400 })
        renderComponent()
        expect(
            screen.getByText('Would cover 200 (50%) of your tickets'),
        ).toBeInTheDocument()
    })
    it('displays ticket volume percent with 1 decimal place when rounding would produce a fractional value', () => {
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map([
                [
                    'order::status',
                    {
                        ticketVolume: 3,
                        handoverCount: 0,
                        ticketVolumePercent: 1.4,
                        handoverPercent: 0,
                    },
                ],
            ]),
            isLoading: false,
        })
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 210 })
        renderComponent()
        expect(
            screen.getByText('Would cover 3 (1.4%) of your tickets'),
        ).toBeInTheDocument()
    })
})
