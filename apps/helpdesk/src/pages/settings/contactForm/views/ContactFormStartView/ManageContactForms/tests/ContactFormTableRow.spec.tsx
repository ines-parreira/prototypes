import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { Components } from 'rest_api/help_center_api/client.generated'
import { RootState, StoreDispatch } from 'state/types'

import { ContactFormFixture } from '../../../../fixtures/contacForm'
import { ContactFormTableRow } from '../ContactFormTableRow'

const mockedLocales = [
    { name: 'English', code: 'en-US' },
    { name: 'Spanish', code: 'es-ES' },
    { name: 'French', code: 'fr-FR' },
    { name: 'German', code: 'de-DE' },
]

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockedLocales,
}))

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const renderComponent = (
    key: number,
    form: Components.Schemas.ContactFormDto,
    onClick = jest.fn(),
) => {
    return render(
        <Provider store={mockStore(defaultState)}>
            <ContactFormTableRow key={key} form={form} onClick={onClick} />,
        </Provider>,
    )
}
describe('<ContactFormTableRow />', () => {
    it('should display the name, ecom platform logo and store name, language, and arrow', () => {
        const form = {
            ...ContactFormFixture,
            name: 'Contact Form name',
            shop_integration: {
                shop_name: 'shopify-store',
                shop_type: 'shopify' as const,
                integration_id: 1,
                account_id: account.id,
            },
        }

        const { container } = renderComponent(form.id, form)

        screen.getByText(form.name)
        screen.getByText(form.shop_integration.shop_name)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the placeholder label when not connected to a shop', () => {
        const form = {
            ...ContactFormFixture,
            name: 'Contact Form name',
            shop_name: null,
        }

        const { container } = renderComponent(form.id, form)

        screen.getByText(form.name)
        screen.getByText(/no store connected/i)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should trigger the onClick function on click', () => {
        const mockedOnClick = jest.fn()
        renderComponent(
            ContactFormFixture.id,
            ContactFormFixture,
            mockedOnClick,
        )

        const contactFormName = screen.getByText(ContactFormFixture.name)

        userEvent.click(contactFormName)

        expect(mockedOnClick).toHaveBeenCalledTimes(1)
    })
})
