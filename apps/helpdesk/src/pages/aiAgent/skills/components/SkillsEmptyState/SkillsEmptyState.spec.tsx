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

    it('should call onCreateSkillFromScratch when "From scratch" is clicked', async () => {
        const user = userEvent.setup()
        const onCreateSkillFromScratch = jest.fn()

        render(
            <ThemeProvider>
                <SkillsEmptyState
                    onCreateSkillFromScratch={onCreateSkillFromScratch}
                />
            </ThemeProvider>,
        )

        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From scratch/i }),
        )
        expect(onCreateSkillFromScratch).toHaveBeenCalledTimes(1)
    })

    it('should call onCreateSkillFromTemplate when "From template" is clicked', async () => {
        const user = userEvent.setup()
        const onCreateSkillFromTemplate = jest.fn()

        render(
            <ThemeProvider>
                <SkillsEmptyState
                    onCreateSkillFromTemplate={onCreateSkillFromTemplate}
                />
            </ThemeProvider>,
        )

        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From template/i }),
        )
        expect(onCreateSkillFromTemplate).toHaveBeenCalledTimes(1)
    })
})
