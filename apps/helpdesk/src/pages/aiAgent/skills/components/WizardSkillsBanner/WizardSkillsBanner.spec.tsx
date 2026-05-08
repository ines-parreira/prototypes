import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'

import { WizardSkillsBanner } from './WizardSkillsBanner'

const renderBanner = () =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <WizardSkillsBanner />
            </ThemeProvider>
        </AxiomProvider>,
        {},
    )

describe('WizardSkillsBanner', () => {
    it('renders the "New" tag, the heading, and the body copy', () => {
        renderBanner()

        expect(screen.getByText('New')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', {
                name: /Skills: more consistent answers for your most common conversations/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/We built skills from some of your existing/i),
        ).toBeInTheDocument()
    })
})
