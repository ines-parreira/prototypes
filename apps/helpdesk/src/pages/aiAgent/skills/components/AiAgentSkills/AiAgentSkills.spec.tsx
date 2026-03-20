import { render, screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'

import { AiAgentSkills } from './AiAgentSkills'

jest.mock('pages/aiAgent/skills/hooks/useHasLinkedSkills')

const mockUseHasLinkedSkills = useHasLinkedSkills as jest.MockedFunction<
    typeof useHasLinkedSkills
>

describe('AiAgentSkills', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
