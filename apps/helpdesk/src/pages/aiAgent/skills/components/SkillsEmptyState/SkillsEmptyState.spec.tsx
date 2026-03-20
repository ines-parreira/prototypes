import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import { SkillsEmptyState } from './SkillsEmptyState'

describe('SkillsEmptyState', () => {
    it('should render empty state with image, heading and description', () => {
        render(
            <ThemeProvider>
                <SkillsEmptyState />
            </ThemeProvider>,
        )

        expect(screen.getByAltText('No skills yet')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'No skills yet' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Skills give you more precise control/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Create skill/i }),
        ).toBeInTheDocument()
    })

    it('should call onCreateSkill when menu items are clicked', async () => {
        const user = userEvent.setup()
        const onCreateSkill = jest.fn()

        render(
            <ThemeProvider>
                <SkillsEmptyState onCreateSkill={onCreateSkill} />
            </ThemeProvider>,
        )

        // Test "From scratch" menu item
        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From scratch/i }),
        )
        expect(onCreateSkill).toHaveBeenCalledTimes(1)

        // Test "From template" menu item
        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From template/i }),
        )
        expect(onCreateSkill).toHaveBeenCalledTimes(2)
    })
})
