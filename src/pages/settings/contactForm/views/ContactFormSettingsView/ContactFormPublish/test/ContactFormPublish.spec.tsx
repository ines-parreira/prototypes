import React from 'react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {screen} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {account} from 'fixtures/account'
import {renderWithRouter} from 'utils/testing'
import ContactFormPublish from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish/ContactFormPublish'
import {CurrentContactFormContext} from 'pages/settings/contactForm/contexts/currentContactForm.context'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {testId} from 'pages/settings/contactForm/components/ContactFormAutoEmbedInstallationCard/ContactFormAutoEmbedInstallationCard'
import {FeatureFlagKey} from 'config/featureFlags'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('ContactFormPublish', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    }

    const renderView = ({state}: {state: Partial<RootState>}) => {
        return renderWithRouter(
            <CurrentContactFormContext.Provider value={ContactFormFixture}>
                <Provider store={mockStore(state)}>
                    <ContactFormPublish />,
                </Provider>
            </CurrentContactFormContext.Provider>
        )
    }

    it('wording check', () => {
        renderView({state: defaultState})
        screen.getByText('Display the contact form anywhere on your website.')
        screen.getByText('Shareable link')
        screen.getByText('Manually embed with code')
    })

    describe('Code snippet', () => {
        it('should provide correct manual embed instructions', () => {
            const {container} = renderView({state: defaultState})
            const instructionsCard = container.querySelector('.card')
            expect(instructionsCard).toMatchSnapshot()
        })
    })

    describe('Contact Form Auto Embed - "ContactFormAutoEmbed" Feature Flag', () => {
        it('should display the right component if disabled', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.ContactFormAutoEmbed]: false,
            }))

            renderView({state: defaultState})

            expect(screen.queryByTestId(testId)).toBeNull()
        })

        it('should display the right component if active', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.ContactFormAutoEmbed]: true,
            }))

            renderView({state: defaultState})

            screen.getByTestId(testId)
        })
    })
})
