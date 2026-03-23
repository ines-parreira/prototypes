import { render, screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import { IntentStatus } from 'pages/aiAgent/skills/types'

import { AiAgentSkills } from './AiAgentSkills'

jest.mock('pages/aiAgent/skills/hooks/useHasLinkedSkills')
jest.mock('pages/aiAgent/skills/hooks/useSkillsTemplates')

const mockUseHasLinkedSkills = useHasLinkedSkills as jest.MockedFunction<
    typeof useHasLinkedSkills
>
const mockUseSkillsTemplates = useSkillsTemplates as jest.MockedFunction<
    typeof useSkillsTemplates
>

const mockSkillTemplate = {
    id: 'order-status',
    name: 'Order status',
    guidanceId: 'order-status-guidance',
    tag: 'Order',
    style: {
        color: 'content-accent-default',
        background: 'surface-accent-default',
    },
    intents: [
        {
            name: 'order::status',
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [],
        },
    ],
}

describe('AiAgentSkills', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillsTemplates.mockReturnValue([
            mockSkillTemplate as ReturnType<typeof useSkillsTemplates>[number],
        ])
    })

    it('should show empty state when there are no linked skills', () => {
        mockUseHasLinkedSkills.mockReturnValue({
            hasLinkedSkills: false,
            isLoading: false,
            isError: false,
        })

        render(
            <ThemeProvider>
                <AiAgentSkills />
            </ThemeProvider>,
        )

        expect(
            screen.getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'No skills yet' }),
        ).toBeInTheDocument()
    })

    it('should show skills content when there are linked skills', () => {
        mockUseHasLinkedSkills.mockReturnValue({
            hasLinkedSkills: true,
            isLoading: false,
            isError: false,
        })

        render(
            <ThemeProvider>
                <AiAgentSkills />
            </ThemeProvider>,
        )

        expect(
            screen.getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Skills content coming soon...'),
        ).toBeInTheDocument()
    })
})
