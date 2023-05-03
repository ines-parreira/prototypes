import React from 'react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {account} from 'fixtures/account'
import {renderWithRouter} from 'utils/testing'
import ContactFormPublish from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish/ContactFormPublish'
import {CurrentContactFormContext} from 'pages/settings/contactForm/contexts/currentContactForm.context'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'

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

    describe('Code snippet', () => {
        it('should provide correct manual embed instructions', () => {
            const {container} = renderView({state: defaultState})
            const instructionsCard = container.querySelector('.card')
            expect(instructionsCard).toMatchSnapshot()
        })
    })
})
