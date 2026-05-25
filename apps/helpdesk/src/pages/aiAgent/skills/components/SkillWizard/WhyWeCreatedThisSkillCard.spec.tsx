import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'

import { WhyWeCreatedThisSkillCard } from './WhyWeCreatedThisSkillCard'

describe('WhyWeCreatedThisSkillCard', () => {
    it('renders the recommendation, impact tag and singular guidance label when there is one guidance', () => {
        render(
            <ThemeProvider>
                <WhyWeCreatedThisSkillCard
                    recommendation="Automate refund requests."
                    estimatedImpact="+6%"
                    guidanceCount={1}
                />
            </ThemeProvider>,
        )

        expect(
            screen.getByText('Why we created this skill'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Automate refund requests.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Generated from 1 guidance'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Estimated impact: +6% automation rate'),
        ).toBeInTheDocument()
    })

    it('uses the plural guidance label when there are multiple guidances', () => {
        render(
            <ThemeProvider>
                <WhyWeCreatedThisSkillCard
                    recommendation="Automate refund requests."
                    estimatedImpact="+6%"
                    guidanceCount={5}
                />
            </ThemeProvider>,
        )

        expect(
            screen.getByText('Generated from 5 guidances'),
        ).toBeInTheDocument()
    })

    it('hides the generated from label and tooltip when there are no guidances', () => {
        render(
            <ThemeProvider>
                <WhyWeCreatedThisSkillCard
                    recommendation="Automate refund requests."
                    estimatedImpact="+6%"
                    guidanceCount={0}
                />
            </ThemeProvider>,
        )

        expect(screen.queryByText(/Generated from/i)).not.toBeInTheDocument()
        expect(
            screen.queryByLabelText('Why we created this skill info'),
        ).not.toBeInTheDocument()
    })
})
