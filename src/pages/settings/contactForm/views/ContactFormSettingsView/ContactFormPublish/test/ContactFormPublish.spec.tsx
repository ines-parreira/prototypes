import React from 'react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {screen} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {QueryClientProvider} from '@tanstack/react-query'
import {RootState, StoreDispatch} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {account} from 'fixtures/account'
import {renderWithRouter} from 'utils/testing'
import ContactFormPublish from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish/ContactFormPublish'
import {CurrentContactFormContext} from 'pages/settings/contactForm/contexts/currentContactForm.context'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID} from 'pages/settings/contactForm/components/ContactFormAutoEmbedCard'
import {FeatureFlagKey} from 'config/featureFlags'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {CONTACT_FORM_PUBLISH_PATH} from 'pages/settings/contactForm/constants'
import {useGetPageEmbedments} from 'pages/settings/contactForm/queries'
import {ContactForm} from 'models/contactForm/types'

jest.mock('../../../../queries', () => {
    const originalModule: Record<string, unknown> = jest.requireActual(
        '../../../../queries'
    )

    return {
        ...originalModule,
        useGetPageEmbedments: jest.fn(() => ({
            isLoading: false,
            isFetched: true,
            data: [],
        })),
    }
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('ContactFormPublish', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    }

    const queryClient = createTestQueryClient()

    const renderView = ({
        state,
        path = CONTACT_FORM_PUBLISH_PATH,
        route = CONTACT_FORM_PUBLISH_PATH,
        contactForm = ContactFormFixture,
    }: {
        state: Partial<RootState>
        path?: string
        route?: string
        contactForm?: ContactForm
    }) => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <CurrentContactFormContext.Provider value={contactForm}>
                    <Provider store={mockStore(state)}>
                        <ContactFormPublish />,
                    </Provider>
                </CurrentContactFormContext.Provider>
            </QueryClientProvider>,
            {
                path,
                route,
            }
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

            expect(
                screen.queryByTestId(CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID)
            ).toBeNull()
        })

        it('should display the right component if active', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.ContactFormAutoEmbed]: true,
            }))

            renderView({state: defaultState})

            screen.getByTestId(CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID)
        })
    })

    it('should not load page embedments if contact form is not connected to the shop', () => {
        renderView({state: defaultState})
        expect(useGetPageEmbedments).toHaveBeenCalledWith(
            ContactFormFixture.id,
            {enabled: false}
        )

        renderView({
            state: defaultState,
            contactForm: {...ContactFormFixture, shop_name: 'test'},
        })
        expect(useGetPageEmbedments).toHaveBeenLastCalledWith(
            ContactFormFixture.id,
            {enabled: true}
        )
    })
})
