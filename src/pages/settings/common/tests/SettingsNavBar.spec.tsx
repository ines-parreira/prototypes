import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {user} from 'fixtures/users'
import {CONTACT_FORM_PAGE_TITLE} from 'pages/settings/contactForm/constants'
import {RootState} from 'state/types'
import {ThemeProvider} from 'theme'
import {renderWithRouter} from 'utils/testing'

import SettingsNavbar from '../SettingsNavbar'

const mockStore = configureMockStore([thunk])

describe('<SettingsNavbar />', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
        currentUser: fromJS(user),
        billing: fromJS(billingState),
    }

    afterEach(() => {
        mockFlags({})
    })

    describe('Contact form link', () => {
        it('should render the link when user role is ADMIN and DecoupleContactForm flag is on', () => {
            mockFlags({
                [FeatureFlagKey.DecoupleContactForm]: true,
            })

            renderWithRouter(
                <Provider store={mockStore(defaultState)}>
                    <ThemeProvider>
                        <SettingsNavbar />
                    </ThemeProvider>
                </Provider>,
                {path: '/'}
            )

            const contactFormLink = screen.getByText(CONTACT_FORM_PAGE_TITLE)
            expect(contactFormLink).toHaveAttribute(
                'to',
                '/app/settings/contact-form'
            )
        })
    })

    it('should render the link to the Click Tracking when having access to the beta', () => {
        mockFlags({
            [FeatureFlagKey.RevenueBetaTesters]: true,
        })
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <ThemeProvider>
                    <SettingsNavbar />
                </ThemeProvider>
            </Provider>,
            {path: '/'}
        )

        expect(screen.getByText('Click Tracking')).toBeInTheDocument()
    })
})
