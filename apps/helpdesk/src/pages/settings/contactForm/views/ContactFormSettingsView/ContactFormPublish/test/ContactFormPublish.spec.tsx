import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { integrationsState } from 'fixtures/integrations'
import type { ContactForm } from 'models/contactForm/types'
import type { ShopifyIntegration } from 'models/integration/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID } from 'pages/settings/contactForm/components/ContactFormAutoEmbedCard'
import { CONTACT_FORM_PUBLISH_PATH } from 'pages/settings/contactForm/constants'
import { CurrentContactFormContext } from 'pages/settings/contactForm/contexts/currentContactForm.context'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { useGetPageEmbedments } from 'pages/settings/contactForm/queries'
import { ContactFormPublish } from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish/ContactFormPublish'
import type { RootState } from 'state/types'

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.Mock
jest.mock('../../../../queries', () => {
    const originalModule: Record<string, unknown> = jest.requireActual(
        '../../../../queries',
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
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))
const mockedUseShopifyIntegrationAndScope = jest.mocked(
    useShopifyIntegrationAndScope,
)
const SHOP_INTEGRATION = {
    id: 1,
    name: 'test',
    type: 'shopify',
    meta: {
        shop_name: 'test',
        need_scope_update: false,
    },
} as ShopifyIntegration
const shop_integration = {
    shop_name: SHOP_INTEGRATION.name,
    shop_type: SHOP_INTEGRATION.type,
    integration_id: SHOP_INTEGRATION.id,
    account_id: account.id,
}
describe('ContactFormPublish', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    }
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
        return render(
            <CurrentContactFormContext.Provider value={contactForm}>
                <>
                    <ContactFormPublish />,
                </>
            </CurrentContactFormContext.Provider>,
            { path: path, initialEntries: [route], storeState: state },
        )
    }
    beforeEach(() => {
        mockedUseShopifyIntegrationAndScope.mockReturnValue({
            integrationId: null,
            needScopeUpdate: false,
            integration: SHOP_INTEGRATION,
        })
    })
    it('wording check', () => {
        renderView({ state: defaultState })
        screen.getByText('Display the contact form anywhere on your website.')
        screen.getByText('Shareable link')
        screen.getByText('Manually embed with code')
    })
    describe('Code snippet', () => {
        it('should provide correct manual embed instructions', () => {
            const { container } = renderView({ state: defaultState })
            const instructionsCard = container.querySelector('.card')
            expect(instructionsCard).toMatchSnapshot()
        })
    })
    describe('Contact Form Auto Embed - "ContactFormAutoEmbed" Feature Flag', () => {
        it('should display the right component if disabled', () => {
            mockUseFlag.mockReturnValue(false)
            renderView({ state: defaultState })
            expect(
                screen.queryByTestId(CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID),
            ).toBeNull()
        })
        it('should display the right component if active', () => {
            mockUseFlag.mockReturnValue(true)
            renderView({ state: defaultState })
            screen.getByTestId(CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID)
        })
    })
    it('should not load page embedments if contact form is not connected to the shop', () => {
        renderView({ state: defaultState })
        expect(useGetPageEmbedments).toHaveBeenCalledWith(
            ContactFormFixture.id,
            { enabled: false },
        )
        renderView({
            state: defaultState,
            contactForm: {
                ...ContactFormFixture,
                shop_integration,
            },
        })
        expect(useGetPageEmbedments).toHaveBeenLastCalledWith(
            ContactFormFixture.id,
            { enabled: true },
        )
    })
    describe('integration banner', () => {
        it('should show when need scope update', () => {
            mockedUseShopifyIntegrationAndScope.mockReturnValue({
                integrationId: 1,
                needScopeUpdate: true,
                integration: SHOP_INTEGRATION,
            })
            renderView({
                state: defaultState,
                contactForm: {
                    ...ContactFormFixture,
                    shop_integration,
                },
            })
            expect(
                screen.getByText(/update your Shopify app permissions/),
            ).toBeInTheDocument()
        })
    })
    describe('mailto replacement section', () => {
        it('should show the section if the contact form is connected to a Shopify store', () => {
            mockedUseShopifyIntegrationAndScope.mockReturnValue({
                integrationId: 1,
                needScopeUpdate: false,
                integration: SHOP_INTEGRATION,
            })
            renderView({
                state: defaultState,
                contactForm: {
                    ...ContactFormFixture,
                    shop_integration,
                },
            })
            expect(screen.getByText('Replace email links')).toBeInTheDocument()
        })
        it('should hide the section when need permision update', () => {
            mockedUseShopifyIntegrationAndScope.mockReturnValue({
                integrationId: 1,
                integration: SHOP_INTEGRATION,
                needScopeUpdate: true,
            })
            renderView({
                state: defaultState,
                contactForm: {
                    ...ContactFormFixture,
                    shop_integration,
                },
            })
            expect(
                screen.queryByText('Replace email links'),
            ).not.toBeInTheDocument()
        })
    })
})
