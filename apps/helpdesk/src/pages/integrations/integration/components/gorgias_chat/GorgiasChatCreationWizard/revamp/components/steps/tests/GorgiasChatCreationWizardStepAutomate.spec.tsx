import type React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { GorgiasChatCreationWizardSteps } from 'models/integration/types'
import Wizard from 'pages/common/components/wizard/Wizard'

import GorgiasChatCreationWizardStepAutomate from '../GorgiasChatCreationWizardStepAutomate'

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false,
)

const mockStore = configureMockStore([thunk])

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    agents: fromJS({
        all: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: { name: 'admin' },
            },
        ],
    }),
}

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    decoration: {},
    meta: {
        language: 'en-US',
        app_id: 1,
    },
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepAutomate
> = {
    isSubmitting: false,
    integration,
}

describe('<GorgiasChatCreationWizardStepAutomate />', () => {
    it('renders wizard placeholder', () => {
        const { getByText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Automate]}>
                        <GorgiasChatCreationWizardStepAutomate {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByText('Automate step placeholder - to be implemented'),
        ).toBeInTheDocument()
    })

    it('renders navigation buttons', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Automate]}>
                        <GorgiasChatCreationWizardStepAutomate {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByRole('button', { name: 'Save & Customize Later' }),
        ).toBeInTheDocument()
        expect(getByRole('button', { name: 'Back' })).toBeInTheDocument()
        expect(getByRole('button', { name: 'Next' })).toBeInTheDocument()
    })

    it('disables buttons when submitting form', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Automate]}>
                        <GorgiasChatCreationWizardStepAutomate
                            {...minProps}
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByRole('button', { name: 'Save & Customize Later' }),
        ).toBeAriaDisabled()
        expect(getByRole('button', { name: 'Back' })).toBeAriaDisabled()
        expect(getByRole('button', { name: /Next/ })).toBeAriaDisabled()
    })
})
