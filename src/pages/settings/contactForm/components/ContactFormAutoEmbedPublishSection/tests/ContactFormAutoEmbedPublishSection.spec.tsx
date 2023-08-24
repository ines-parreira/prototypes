import React from 'react'

import LD from 'launchdarkly-react-client-sdk'

import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClientProvider} from '@tanstack/react-query'
import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'
import {PageEmbedmentFixture} from 'pages/settings/contactForm/fixtures/pageEmbedment'
import ContactFormAutoEmbedPublishSection, {
    ContactFormAutoEmbedPublishSectionProps,
} from '../ContactFormAutoEmbedPublishSection'
import {CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID} from '../../ContactFormAutoEmbedCard'

const defaultProps: ContactFormAutoEmbedPublishSectionProps = {
    contactFormShopName: 'store-name',
    contactFormId: 1,
    pageEmbedments: [],
}

const queryClient = createTestQueryClient()

const SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED = 'shopify-store-updated'
const SHOPIFY_SHOP_NAME_UPDATE_NEEDED = 'shopify-store-update-needed'

const defaultStateWithIntegrations = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'facebook',
                meta: {
                    shop_name: 'foo',
                },
            },
            {
                id: 2,
                type: 'shopify',
                meta: {
                    shop_name: SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED,
                    need_scope_update: false,
                },
            },
            {
                id: 3,
                type: 'shopify',
                meta: {
                    shop_name: SHOPIFY_SHOP_NAME_UPDATE_NEEDED,
                    need_scope_update: true,
                },
            },
        ],
    }),
} as RootState

const mockFeatureFlagValue = (returnValue: boolean) => {
    jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
        [FeatureFlagKey.ContactFormAutoEmbed]: returnValue,
    }))
}

const renderView = (ui: JSX.Element, {state}: {state: Partial<RootState>}) => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>{ui}</Provider>
        </QueryClientProvider>
    )
}

describe('<ContactFormAutoEmbedPublishSection />', () => {
    it('renders null if the feature flag is not active', () => {
        mockFeatureFlagValue(false)

        const {container} = renderView(
            <ContactFormAutoEmbedPublishSection {...defaultProps} />,
            {
                state: defaultStateWithIntegrations,
            }
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('Contact Form - not connected to any stores', () => {
        mockFeatureFlagValue(true)

        const {container} = renderView(
            <ContactFormAutoEmbedPublishSection
                contactFormShopName={null}
                contactFormId={1}
                pageEmbedments={[]}
            />,
            {
                state: defaultStateWithIntegrations,
            }
        )

        expect(container.firstChild).toMatchSnapshot()

        const testRegexp = /to enable auto-embedding/i

        screen.getByText(testRegexp)

        userEvent.click(screen.getByLabelText('Close Icon'))

        expect(screen.queryByText(testRegexp)).toBeNull()
    })

    it('Contact Form - connected to a shopify stores - no update needed', () => {
        mockFeatureFlagValue(true)

        const {container} = renderView(
            <ContactFormAutoEmbedPublishSection
                contactFormShopName={SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED}
                contactFormId={1}
                pageEmbedments={[]}
            />,
            {
                state: defaultStateWithIntegrations,
            }
        )

        expect(container.firstChild).toMatchSnapshot()

        expect(
            screen.queryByText(/update your Shopify app permissions/i)
        ).toBeNull()

        screen.getByText(/Automatically embed on your website/i)
        screen.getByText(/recommended/i)
        screen.getByText(/Gorgias will automatically embed/i)

        screen.getByTestId(CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID)
    })

    it('Contact Form - connected to a shopify stores - update needed', () => {
        mockFeatureFlagValue(true)

        const {container} = renderView(
            <ContactFormAutoEmbedPublishSection
                contactFormShopName={SHOPIFY_SHOP_NAME_UPDATE_NEEDED}
                contactFormId={1}
                pageEmbedments={[]}
            />,
            {
                state: defaultStateWithIntegrations,
            }
        )

        expect(container.firstChild).toMatchSnapshot()

        screen.getByText(/update your Shopify app permissions/i)

        screen.getByText(/Automatically embed on your website/i)
        screen.getByText(/recommended/i)
        screen.getByText(/Gorgias will automatically embed/i)

        screen.getByTestId(CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID)
    })

    it('Contact Form - connected to a non-shopify store', () => {
        mockFeatureFlagValue(true)

        const {container} = renderView(
            <ContactFormAutoEmbedPublishSection
                contactFormShopName={'another-store'}
                contactFormId={1}
                pageEmbedments={[]}
            />,
            {
                state: defaultStateWithIntegrations,
            }
        )

        expect(container.firstChild).toMatchSnapshot()

        screen.getByText(/Automatically embed on your website/i)
        screen.getByText(/recommended/i)
        screen.getByText(/Gorgias will automatically embed/i)
    })

    it('Contact Form - connected to a Shopify store with embedment already', () => {
        mockFeatureFlagValue(true)

        const {container} = renderView(
            <ContactFormAutoEmbedPublishSection
                contactFormShopName={SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED}
                contactFormId={1}
                pageEmbedments={[PageEmbedmentFixture]}
            />,
            {
                state: defaultStateWithIntegrations,
            }
        )

        expect(container.firstChild).toMatchSnapshot()

        screen.getByText(/Automatically embed on your website/i)
        screen.getByText(/Gorgias will automatically embed/i)
        expect(screen.queryByText(/recommended/i)).toBeNull()
    })
})
