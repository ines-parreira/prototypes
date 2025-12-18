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
    step: GorgiasChatCreationWizardSteps.Basics,
    children: <div>Step content</div>,
    preview: <div>Preview content</div>,
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

    it('renders step title and content', () => {
        const { getByText, getAllByText } = renderComponent()

        expect(getAllByText('Set up the basics').length).toBeGreaterThan(0)
        expect(getByText('Step content')).toBeInTheDocument()
        expect(getByText('Preview content')).toBeInTheDocument()
        expect(getByText('Next')).toBeInTheDocument()
    })

    it('logs wizard step started event on mount', () => {
        renderComponent()

        expect(mockLogWizardEvent).toHaveBeenCalledWith(
            SegmentEvent.ChatWidgetWizardStepStarted,
        )
    })

    it('renders description for steps that have one', () => {
        const { getByText } = renderComponent({
            step: GorgiasChatCreationWizardSteps.Branding,
        })

        expect(
            getByText("Give the chat widget your brand's look and feel"),
        ).toBeInTheDocument()
    })

    it('does not render description for Basics step', () => {
        const { queryByText } = renderComponent({
            step: GorgiasChatCreationWizardSteps.Basics,
        })

        expect(
            queryByText("Give the chat widget your brand's look and feel"),
        ).not.toBeInTheDocument()
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

    it('shows preview placeholder when showPreviewPlaceholder is true', () => {
        const { getByText, queryByText } = renderComponent({
            showPreviewPlaceholder: true,
        })

        expect(
            getByText('Connect a store to use AI Agent features in Chat'),
        ).toBeInTheDocument()
        expect(queryByText('Preview content')).not.toBeInTheDocument()
    })

    it('shows preview content when showPreviewPlaceholder is false', () => {
        const { getByText, queryByText } = renderComponent({
            showPreviewPlaceholder: false,
        })

        expect(getByText('Preview content')).toBeInTheDocument()
        expect(
            queryByText('Connect a store to use AI Agent features in Chat'),
        ).not.toBeInTheDocument()
    })
})
