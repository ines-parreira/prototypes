import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import { SkillsHeader } from './SkillsHeader'

describe('SkillsHeader', () => {
    it('should render the title and all action buttons', () => {
        render(
            <ThemeProvider>
                <SkillsHeader />
            </ThemeProvider>,
        )

        expect(
            screen.getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Learning resources/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /View intents/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Create skill/i }),
        ).toBeInTheDocument()
    })

    it('should call callbacks when buttons are clicked', async () => {
        const user = userEvent.setup()
        const onViewIntents = jest.fn()
        const onCreateSkill = jest.fn()
        const mockWindowOpen = jest.fn()
        window.open = mockWindowOpen

        render(
            <ThemeProvider>
                <SkillsHeader
                    onViewIntents={onViewIntents}
                    onCreateSkill={onCreateSkill}
                />
            </ThemeProvider>,
        )

        await user.click(
            screen.getByRole('button', { name: /Learning resources/i }),
        )
        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://link.gorgias.com/bdb652',
            '_blank',
            'noopener,noreferrer',
        )

        await user.click(screen.getByRole('button', { name: /View intents/i }))
        expect(onViewIntents).toHaveBeenCalledTimes(1)

        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From scratch/i }),
        )
        expect(onCreateSkill).toHaveBeenCalledTimes(1)

        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From template/i }),
        )
        expect(onCreateSkill).toHaveBeenCalledTimes(2)
    })
})
