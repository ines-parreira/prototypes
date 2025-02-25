import React from 'react'

import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { keyBy } from 'lodash'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { WorkflowEditorContext } from 'pages/automate/workflows/hooks/useWorkflowEditor'
import { visualBuilderGraphSimpleChoicesFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { RootState } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import WorkflowVisualBuilder from '../WorkflowVisualBuilder'

const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),

    billing: fromJS(billingState),
} as RootState

const contactForm = ContactFormFixture
const mockedStore = mockStore({
    ...defaultState,
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {
                automationSettingsByContactFormId: {
                    [contactForm.id]: {
                        workflows: [],
                        order_management: { enabled: false },
                    },
                },
            },
            contactForms: {
                contactFormById: keyBy([contactForm], 'id'),
            },
        },
    },
})

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    const history = createMemoryHistory({ initialEntries: [route] })
    return {
        ...renderWithQueryClientProvider(
            <Provider store={mockedStore}>
                <Router history={history}>{ui}</Router>
            </Provider>,
        ),
        history,
    }
}

describe('<WorkflowVisualBuilder />', () => {
    it('should render template preview', () => {
        renderWithRouter(
            <WorkflowEditorContext.Provider
                value={{
                    configuration: {
                        available_languages: ['en-GB'],
                        id: '0000',
                        initial_step_id: '1',
                        internal_id: '0000',
                        is_draft: false,
                        name: 'name',
                        steps: [],
                        transitions: [],
                    },
                    configurationSizeToLimitRate: 500,
                    currentLanguage: 'en-GB',
                    deleteTranslation: jest.fn(),
                    dispatch: jest.fn(),
                    handleDiscard: jest.fn(),
                    handlePublish: jest.fn(),
                    handleSave: jest.fn(),
                    handleValidate: jest.fn(),
                    isDirty: false,
                    isFetchPending: false,
                    isFlowPublishingInChannels: true,
                    isPublishPending: false,
                    isSavePending: false,
                    isTesting: false,
                    setFlowPublishingInChannels: jest.fn(),
                    setIsTesting: jest.fn(),
                    setWorkflowStepMetrics: jest.fn(),
                    setZoom: jest.fn(),
                    switchLanguage: jest.fn(),
                    translateGraph: jest.fn(),
                    translateKey: jest.fn(),
                    translationSizeToLimitRate: 500,
                    visualBuilderGraph: visualBuilderGraphSimpleChoicesFixture,
                    workflowStepMetrics: null,
                    zoom: 1,
                    handleValidateSize: jest.fn(),
                }}
            >
                <WorkflowVisualBuilder
                    isNew={false}
                    dispatch={jest.fn()}
                    visualBuilderGraph={visualBuilderGraphSimpleChoicesFixture}
                />
            </WorkflowEditorContext.Provider>,
        )

        expect(screen.getByText('entrypoint')).toBeInTheDocument()
    })
})
