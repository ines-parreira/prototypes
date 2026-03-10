import type React from 'react'

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

jest.mock('../../hooks/useLogWizardEvent', () => () => mockLogWizardEvent)

const mockUseIsIntersecting = jest.fn()
jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => (ref: React.RefObject<HTMLElement>) => mockUseIsIntersecting(ref),
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
        mockUseIsIntersecting.mockReturnValue(true)
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

    it('shows footer shadow when content is not intersecting viewport', () => {
        mockUseIsIntersecting.mockReturnValue(false)

        const { container } = renderComponent()

        expect(
            container.querySelector('[class*="footerShadow"]'),
        ).toBeInTheDocument()
    })

    it('hides footer shadow when content is intersecting viewport', () => {
        mockUseIsIntersecting.mockReturnValue(true)

        const { container } = renderComponent()

        expect(
            container.querySelector('[class*="footerShadow"]'),
        ).not.toBeInTheDocument()
    })
})
