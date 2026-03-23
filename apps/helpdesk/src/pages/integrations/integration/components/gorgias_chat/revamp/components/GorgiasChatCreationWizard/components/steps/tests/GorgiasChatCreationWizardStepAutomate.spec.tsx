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

jest.mock('models/selfServiceConfiguration/queries', () => ({
    useGetSelfServiceConfiguration: () => ({
        data: undefined,
        isLoading: false,
    }),
}))

jest.mock(
    'pages/automate/common/hooks/useSelfServiceConfigurationUpdate',
    () => ({
        useSelfServiceConfigurationUpdate: () => ({
            handleSelfServiceConfigurationUpdate: jest.fn(),
        }),
    }),
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
    integrations: fromJS({
        integrations: [],
    }),
    entities: {
        chatsApplicationAutomationSettings: {},
    },
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

const renderComponent = (
    props: Partial<
        React.ComponentProps<typeof GorgiasChatCreationWizardStepAutomate>
    > = {},
) => {
    return render(
        <MemoryRouter>
            <Provider store={mockStore(mockStoreState)}>
                <Wizard steps={[GorgiasChatCreationWizardSteps.Automate]}>
                    <GorgiasChatCreationWizardStepAutomate
                        {...minProps}
                        {...props}
                    />
                </Wizard>
            </Provider>
        </MemoryRouter>,
    )
}

describe('<GorgiasChatCreationWizardStepAutomate />', () => {
    it('renders step title', () => {
        const { getAllByText } = renderComponent()

        expect(getAllByText('Enable order management').length).toBeGreaterThan(
            0,
        )
    })

    it('renders navigation buttons', () => {
        const { getByRole } = renderComponent()

        expect(
            getByRole('button', { name: 'Save and Exit' }),
        ).toBeInTheDocument()
        expect(getByRole('button', { name: 'Back' })).toBeInTheDocument()
        expect(getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('disables buttons when submitting form', () => {
        const { getByRole } = renderComponent({ isSubmitting: true })

        expect(
            getByRole('button', { name: 'Save and Exit' }),
        ).toBeAriaDisabled()
        expect(getByRole('button', { name: 'Back' })).toBeAriaDisabled()
        expect(getByRole('button', { name: /Continue/ })).toBeAriaDisabled()
    })
})
