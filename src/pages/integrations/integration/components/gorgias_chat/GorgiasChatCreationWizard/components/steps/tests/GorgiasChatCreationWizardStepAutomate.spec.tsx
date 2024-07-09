import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {QueryClientProvider} from '@tanstack/react-query'
import {entitiesInitialState} from 'fixtures/entities'
import {integrationsStateWithShopify} from 'fixtures/integrations'

import {GorgiasChatCreationWizardSteps} from 'models/integration/types'

import Wizard from 'pages/common/components/wizard/Wizard'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import GorgiasChatCreationWizardStepAutomate from '../GorgiasChatCreationWizardStepAutomate'

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false
)

const mockStore = configureMockStore([thunk])

const store = mockStore({
    entities: entitiesInitialState,
    integrations: integrationsStateWithShopify,
    billing: fromJS({products: []}),
})

const queryClient = mockQueryClient()

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    decoration: {},
    meta: {
        language: 'en-US',
    },
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepAutomate
> = {
    isSubmitting: false,
    integration,
}

describe('<GorgiasChatCreationWizardStepAutomate.spec />', () => {
    it('renders wizard without store selected', () => {
        const {getByText} = render(
            <DndProvider backend={HTML5Backend}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <Provider store={store}>
                            <Wizard
                                steps={[
                                    GorgiasChatCreationWizardSteps.Automate,
                                ]}
                            >
                                <GorgiasChatCreationWizardStepAutomate
                                    {...minProps}
                                />
                            </Wizard>
                        </Provider>
                    </MemoryRouter>
                </QueryClientProvider>
            </DndProvider>
        )

        expect(getByText('Select a store')).toBeInTheDocument()
    })
})
