import type React from 'react'

import { fireEvent, render } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import * as actions from 'state/integrations/actions'

import GorgiasChatCreationWizardStepInstallation from '../GorgiasChatCreationWizardStepInstallation'

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false,
)

const mockStore = configureMockStore([thunk])

const defaultState = {
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
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: { name: 'agent' },
            },
        ],
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
            },
        ],
    }),
}

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    decoration: {},
}) as Map<any, any>

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepInstallation
> = {
    integration,
    isSubmitting: false,
}

describe('<GorgiasChatCreationWizardStepInstallation />', () => {
    it('renders wizard with default options selected', () => {
        const { getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepInstallation
                            {...minProps}
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByLabelText('Manual installation', { selector: 'input' }),
        ).toBeChecked()
    })

    it('renders wizard with default options selected when shopify store is connected', () => {
        const { getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepInstallation
                            {...minProps}
                            integration={integration.setIn(
                                ['meta', 'shop_integration_id'],
                                1,
                            )}
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByLabelText('1-click installation for Shopify', {
                selector: 'input',
            }),
        ).toBeChecked()
    })

    it('submits form when using 1-click installation for Shopify', () => {
        const { getByText } = render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepInstallation
                            {...minProps}
                            integration={integration.setIn(
                                ['meta', 'shop_integration_id'],
                                1,
                            )}
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByText('Install'))

        expect(spy.mock.calls).toMatchSnapshot()
    })
})
