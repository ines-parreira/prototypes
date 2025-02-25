import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { billingState } from 'fixtures/billing'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import { CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS } from 'pages/settings/contactForm/constants'
import { RootState } from 'state/types'

import ContactFormFlowsBanner from '../ContactFormFlowsBanner'

jest.mock('react-router-dom')
jest.mock('pages/automate/common/hooks/useContactFormAutomationSettings')

const mockUseContactFormAutomationSettings =
    useContactFormAutomationSettings as jest.Mock
const mockStore = configureMockStore()

describe('<ContactFormFlowsBanner />', () => {
    const defaultState: Partial<RootState> = {
        billing: fromJS(billingState),
    }
    const mockProps = {
        contactFormId: 123,
        shopName: 'example-shop',
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render banner if flows are disabled', () => {
        mockUseContactFormAutomationSettings.mockReturnValue({
            automationSettings: CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS,
            isFetchPending: false,
        })

        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <ContactFormFlowsBanner {...mockProps} />
            </Provider>,
        )

        expect(container).not.toBeEmptyDOMElement()
    })

    it('should not render if flows are enabled', () => {
        mockUseContactFormAutomationSettings.mockReturnValue({
            automationSettings: {
                ...CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS,
                workflows: [{ id: '123', enabled: true }],
            },
            isFetchPending: false,
        })

        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <ContactFormFlowsBanner {...mockProps} />
            </Provider>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should not render banner if Automate settings are not loaded', () => {
        mockUseContactFormAutomationSettings.mockReturnValue({
            automationSettings: CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS,
            isFetchPending: true,
        })

        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <ContactFormFlowsBanner {...mockProps} />
            </Provider>,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
