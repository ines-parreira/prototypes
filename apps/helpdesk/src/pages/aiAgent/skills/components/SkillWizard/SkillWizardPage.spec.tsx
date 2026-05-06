import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom'

import { ThemeProvider } from 'core/theme'

import { SkillWizardPage } from './SkillWizardPage'

const wizardProps: { current: any } = { current: undefined }

jest.mock('./SkillWizard', () => ({
    SkillWizard: (props: any) => {
        wizardProps.current = props
        return (
            <div>
                <p>initialStep: {String(props.initialStep)}</p>
                <button onClick={props.onClose}>Close from wizard</button>
                <button onClick={() => props.onStepChange(7)}>
                    Move to step 7
                </button>
            </div>
        )
    },
}))

const SHOP_NAME = 'ekster'
const WIZARD_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/skills/wizard`
const SKILLS_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/skills`

const PathProbe = () => {
    const location = useLocation()
    return (
        <div>
            <p>path: {location.pathname}</p>
            <p>search: {location.search}</p>
        </div>
    )
}

const renderAt = (initialEntry: string) =>
    render(
        <ThemeProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Switch>
                    <Route
                        path="/app/ai-agent/shopify/:shopName/skills/wizard"
                        component={SkillWizardPage}
                    />
                    <Route
                        path="/app/ai-agent/shopify/:shopName/skills"
                        render={() => <p>Skills landing</p>}
                    />
                </Switch>
                <PathProbe />
            </MemoryRouter>
        </ThemeProvider>,
    )

describe('SkillWizardPage', () => {
    beforeEach(() => {
        wizardProps.current = undefined
    })

    it('renders the wizard for the /skills/wizard route with no initial step', () => {
        renderAt(WIZARD_PATH)

        expect(screen.getByText('initialStep: undefined')).toBeInTheDocument()
    })

    it('parses ?step=N from the URL and forwards it as initialStep', () => {
        renderAt(`${WIZARD_PATH}?step=5`)

        expect(screen.getByText('initialStep: 5')).toBeInTheDocument()
    })

    it('ignores invalid step values', () => {
        renderAt(`${WIZARD_PATH}?step=not-a-number`)

        expect(screen.getByText('initialStep: undefined')).toBeInTheDocument()
    })

    it('ignores zero or negative steps', () => {
        renderAt(`${WIZARD_PATH}?step=0`)
        expect(screen.getByText('initialStep: undefined')).toBeInTheDocument()
    })

    it('replaces the step query param when the wizard reports a step change', async () => {
        const user = userEvent.setup()
        renderAt(`${WIZARD_PATH}?step=3`)

        await user.click(screen.getByRole('button', { name: 'Move to step 7' }))

        expect(screen.getByText('search: ?step=7')).toBeInTheDocument()
        expect(screen.getByText(`path: ${WIZARD_PATH}`)).toBeInTheDocument()
    })

    it('navigates to the skills list when the wizard requests close', async () => {
        const user = userEvent.setup()
        renderAt(`${WIZARD_PATH}?step=2`)

        await user.click(
            screen.getByRole('button', { name: 'Close from wizard' }),
        )

        expect(screen.getByText('Skills landing')).toBeInTheDocument()
        expect(screen.getByText(`path: ${SKILLS_PATH}`)).toBeInTheDocument()
    })

    it('passes a draftKnowledge function that returns sourceId based on the active item index', () => {
        renderAt(WIZARD_PATH)

        const draftKnowledge = wizardProps.current.draftKnowledge
        expect(typeof draftKnowledge).toBe('function')
        expect(draftKnowledge('Returns', 0)).toEqual({
            sourceId: 1,
            sourceSetId: 1,
        })
        expect(draftKnowledge('Cancellations', 4)).toEqual({
            sourceId: 5,
            sourceSetId: 1,
        })
    })
})
