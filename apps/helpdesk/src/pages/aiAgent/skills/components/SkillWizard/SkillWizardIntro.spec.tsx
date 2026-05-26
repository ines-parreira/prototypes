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
            screen.getByText('Preparing your skills for review'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'They’re all ready to enable, give them a quick look first',
            ),
        ).toBeInTheDocument()
    })

    it('shows the partial copy with the reviewable count when only some skills can be reviewed', () => {
        render(
            <ThemeProvider>
                <SkillWizardIntro reviewableCount={7} totalCount={10} />
            </ThemeProvider>,
        )

        expect(
            screen.getByText('Preparing your skills for review'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                '7 of your skills are ready to enable, give them a quick look first',
            ),
        ).toBeInTheDocument()
    })
})
