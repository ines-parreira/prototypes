import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'

import { SkillRecapStep } from './SkillRecapStep'

describe('SkillRecapStep', () => {
    it('renders the placeholder copy', () => {
        render(
            <ThemeProvider>
                <SkillRecapStep />
            </ThemeProvider>,
        )

        expect(screen.getByText('Recap step')).toBeInTheDocument()
    })
})
