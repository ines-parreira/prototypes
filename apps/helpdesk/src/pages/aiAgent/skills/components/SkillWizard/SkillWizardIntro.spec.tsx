import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'

import { SkillWizardIntro } from './SkillWizardIntro'

describe('SkillWizardIntro', () => {
    it('shows the all-reviewable copy when every skill can be reviewed', () => {
        render(
            <ThemeProvider>
                <SkillWizardIntro reviewableCount={4} totalCount={4} />
            </ThemeProvider>,
        )

        expect(
            screen.getByText('All of your skills are ready to enable'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Give them a quick review first'),
        ).toBeInTheDocument()
    })

    it('shows the partial copy with the reviewable count when only some skills can be reviewed', () => {
        render(
            <ThemeProvider>
                <SkillWizardIntro reviewableCount={7} totalCount={10} />
            </ThemeProvider>,
        )

        expect(
            screen.getByText('Good news: 7 of your skills are ready to enable'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Give them a quick review first'),
        ).toBeInTheDocument()
    })
})
