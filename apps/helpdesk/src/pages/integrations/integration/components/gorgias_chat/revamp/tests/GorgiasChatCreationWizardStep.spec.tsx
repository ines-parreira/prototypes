import { SegmentEvent } from '@repo/logging'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { GorgiasChatCreationWizardSteps } from 'models/integration/types/gorgiasChat'
import Wizard from 'pages/common/components/wizard/Wizard'

import { GorgiasChatCreationWizardStep } from '../GorgiasChatCreationWizardStep'

const mockLogWizardEvent = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/hooks/useLogWizardEvent',
    () => () => mockLogWizardEvent,
)

const mockStore = configureMockStore([thunk])

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    integrations: fromJS({
        integrations: [],
    }),
}

const defaultProps = {
    children: <div>Step content</div>,
    footer: <button>Next</button>,
}

const renderComponent = (
    props: Partial<
        React.ComponentProps<typeof GorgiasChatCreationWizardStep>
    > = {},
) => {
    return render(
        <MemoryRouter>
            <Provider store={mockStore(mockStoreState)}>
                <Wizard steps={Object.values(GorgiasChatCreationWizardSteps)}>
                    <GorgiasChatCreationWizardStep
                        {...defaultProps}
                        {...props}
                    />
                </Wizard>
            </Provider>
        </MemoryRouter>,
    )
}

describe('GorgiasChatCreationWizardStep', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders children and footer', () => {
        const { getByText } = renderComponent()

        expect(getByText('Step content')).toBeInTheDocument()
        expect(getByText('Next')).toBeInTheDocument()
    })

    it('logs wizard step started event on mount', () => {
        renderComponent()

        expect(mockLogWizardEvent).toHaveBeenCalledWith(
            SegmentEvent.ChatWidgetWizardStepStarted,
        )
    })
})
