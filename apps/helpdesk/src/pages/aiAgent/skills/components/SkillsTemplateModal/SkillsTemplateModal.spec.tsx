import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'
import { IntentStatus } from 'pages/aiAgent/skills/types'

import { SkillsTemplateModal } from './SkillsTemplateModal'

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations', () => ({
    useGetTicketChannelsStoreIntegrations: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(),
    }),
)
jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        getLast28DaysDateRange: jest.fn(() => ({
            start_datetime: '2024-01-01T00:00:00.000Z',
            end_datetime: '2024-01-28T23:59:59.000Z',
        })),
    }),
)
jest.mock(
    'pages/aiAgent/skills/components/SharedTableComponents/MetricCells',
    () => ({
        MetricCell: jest.fn(() => null),
    }),
)

const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.Mock

const mockTemplates: SkillTemplate[] = [
    {
        id: 'order-status',
        name: 'Order Status',
        guidanceId: 'order-status-guidance',
        intents: [
            {
                name: 'order::status',
                status: IntentStatus.NotLinked,
                help_center_id: 0,
                articles: [],
            },
        ],
    },
    {
        id: 'order-cancel',
        name: 'Order Cancellations',
        guidanceId: 'order-cancel-guidance',
        intents: [
            {
                name: 'order::cancel',
                status: IntentStatus.NotLinked,
                help_center_id: 0,
                articles: [],
            },
        ],
    },
]

const renderComponent = (
    props?: Partial<{
        isOpen: boolean
        onOpenChange: (open: boolean) => void
        onCreateSkillsFromTemplate: () => void
        skillsTemplates: SkillTemplate[]
    }>,
) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <SkillsTemplateModal
                    skillsTemplates={mockTemplates}
                    isOpen={true}
                    onOpenChange={jest.fn()}
                    onCreateSkillsFromTemplate={jest.fn()}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )

describe('SkillsTemplateModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { storeName: 'test-store' },
        })
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 1,
            outcomeCustomFieldId: 2,
        })
    })

    it('does not render when isOpen is false', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders a dialog when isOpen is true', () => {
        renderComponent()

        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders the "Templates" heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Templates' }),
        ).toBeInTheDocument()
    })

    it('renders the description text', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Use our pre-built templates as a starting point.',
            ),
        ).toBeInTheDocument()
    })

    it('renders a card for each template', () => {
        renderComponent()

        expect(screen.getByText('Order Status')).toBeInTheDocument()
        expect(screen.getByText('Order Cancellations')).toBeInTheDocument()
    })

    it('calls onCreateSkillsFromTemplate when a card is clicked', async () => {
        const user = userEvent.setup()
        const onCreateSkillsFromTemplate = jest.fn()
        renderComponent({ onCreateSkillsFromTemplate })

        await user.click(screen.getByText('Order Status'))

        expect(onCreateSkillsFromTemplate).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenChange with false when Escape is pressed', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderComponent({ onOpenChange })

        await user.keyboard('{Escape}')

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
