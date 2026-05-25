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
                name: /We created your core skills using some of your existing guidance/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /With skills, AI Agent will now follow specific instructions every time it detects matching intents/i,
            ),
        ).toBeInTheDocument()
    })
})
