import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/productPrices'
import {CurrentContactFormContext} from 'pages/settings/contactForm/contexts/currentContactForm.context'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'

import {account} from '../../../../../../fixtures/account'
import {billingState} from '../../../../../../fixtures/billing'
import {integrationsStateWithShopify} from '../../../../../../fixtures/integrations'
import {ContactForm} from '../../../../../../models/contactForm/types'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {renderWithRouter} from '../../../../../../utils/testing'
import {getLocalesResponseFixture} from '../../../../helpCenter/fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from '../../../../helpCenter/providers/SupportedLocales'
import {CONTACT_FORM_PREFERENCES_PATH} from '../../../constants'
import {ContactFormFixture} from '../../../fixtures/contacForm'
import {insertContactFormIdParam} from '../../../utils/navigation'
import ContactFormPreferences from '../ContactFormPreferences'

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
jest.mock('pages/settings/contactForm/hooks/useContactFormApi')

const mockedUseContactFormApi = jest.mocked(useContactFormApi)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const FORM_ID = 1
const defaultState: Partial<RootState> = {
    integrations: fromJS(integrationsStateWithShopify),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.price_id,
            },
        },
    }),
    billing: fromJS(billingState),
    entities: {
        contactForm: {
            contactForms: {
                contactFormById: {
                    [FORM_ID]: ContactFormFixture,
                },
            },
        },
    } as any,
    ui: {
        contactForm: {
            currentId: Number(FORM_ID),
        },
    } as any,
}

const renderView = ({
    path,
    state = defaultState,
    contactFormState,
}: {
    path: string
    state?: Partial<RootState>
    contactFormState?: Partial<ContactForm>
}) => {
    const history = createMemoryHistory({
        initialEntries: [
            insertContactFormIdParam(CONTACT_FORM_PREFERENCES_PATH, FORM_ID),
        ],
    })

    return renderWithRouter(
        <Provider store={mockStore(state)}>
            <CurrentContactFormContext.Provider
                value={{...ContactFormFixture, ...contactFormState}}
            >
                <ContactFormPreferences />
            </CurrentContactFormContext.Provider>
        </Provider>,
        {
            path,
            history,
        }
    )
}
describe('<ContactFormPreferences />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture
        )
        mockedUseContactFormApi.mockReturnValue({
            isReady: true,
        } as unknown as ReturnType<typeof useContactFormApi>) // TODO: Discuss using of jest-mock-extended
    })

    it('should render with contact form name', () => {
        renderView({path: CONTACT_FORM_PREFERENCES_PATH})

        expect(screen.getByLabelText('Contact form name')).toHaveValue(
            ContactFormFixture.name
        )
    })

    describe('when change store', () => {
        const shopName = 'gorgiastest'
        it('should render store selection dropdown when Automate enabled', () => {
            renderView({path: CONTACT_FORM_PREFERENCES_PATH})

            expect(screen.getByLabelText('Connect a store')).toBeInTheDocument()
            expect(screen.getByLabelText('Connect a store')).not.toHaveValue()
        })

        it('should call API with new store', async () => {
            const fakeUpdate = jest.fn(() =>
                Promise.resolve(ContactFormFixture)
            )

            mockedUseContactFormApi.mockReturnValue({
                updateContactForm: fakeUpdate,
            } as unknown as ReturnType<typeof useContactFormApi>) // TODO: Discuss using of jest-mock-extended

            renderView({path: CONTACT_FORM_PREFERENCES_PATH})

            // Selector should be enabled
            expect(screen.getByLabelText('Connect a store')).toBeEnabled()

            // Select the store
            userEvent.click(screen.getByLabelText('Connect a store'))
            userEvent.click(screen.getByText(shopName))

            await waitFor(() =>
                expect(screen.getByText('Save Changes')).toBeEnabled()
            )

            userEvent.click(screen.getByText('Save Changes'))

            await waitFor(() =>
                expect(fakeUpdate).toHaveBeenCalledWith(FORM_ID, {
                    shop_name: shopName,
                })
            )
        })
    })
})
