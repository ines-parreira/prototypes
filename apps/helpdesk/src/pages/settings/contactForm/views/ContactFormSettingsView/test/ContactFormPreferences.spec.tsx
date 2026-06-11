import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'

import { useFlagWithLoading } from '@repo/feature-flags'

import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/plans'
import { CurrentContactFormContext } from 'pages/settings/contactForm/contexts/currentContactForm.context'
import { useContactFormApi } from 'pages/settings/contactForm/hooks/useContactFormApi'

import { account } from '../../../../../../fixtures/account'
import { billingState } from '../../../../../../fixtures/billing'
import { integrationsStateWithShopify } from '../../../../../../fixtures/integrations'
import type { ContactForm } from '../../../../../../models/contactForm/types'
import type { RootState } from '../../../../../../state/types'
import { getLocalesResponseFixture } from '../../../../helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from '../../../../helpCenter/providers/SupportedLocales'
import { CONTACT_FORM_PREFERENCES_PATH } from '../../../constants'
import { ContactFormFixture } from '../../../fixtures/contacForm'
import { insertContactFormIdParam } from '../../../utils/navigation'
import { ContactFormPreferences } from '../ContactFormPreferences'

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
jest.mock('pages/settings/contactForm/hooks/useContactFormApi')
const mockedUseContactFormApi = jest.mocked(useContactFormApi)
const FORM_ID = 1
const defaultState: Partial<RootState> = {
    integrations: fromJS(integrationsStateWithShopify),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.plan_id,
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
    return render(
        <CurrentContactFormContext.Provider
            value={{ ...ContactFormFixture, ...contactFormState }}
        >
            <ContactFormPreferences />
        </CurrentContactFormContext.Provider>,
        {
            path,
            initialEntries: [
                insertContactFormIdParam(
                    CONTACT_FORM_PREFERENCES_PATH,
                    FORM_ID,
                ),
            ],
            storeState: state,
        },
    )
}
describe('<ContactFormPreferences />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        // `resetAllMocks` strips the implementation off the global
        // `@repo/feature-flags` mock, so `useFlagWithLoading` (read by
        // `useTrialAccess` via `useAiAgentAccess`) would otherwise return
        // `undefined` and break destructuring.
        jest.mocked(useFlagWithLoading).mockReturnValue({
            value: false,
            isLoading: false,
        })
        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture,
        )
        mockedUseContactFormApi.mockReturnValue({
            isReady: true,
        } as unknown as ReturnType<typeof useContactFormApi>) // TODO: Discuss using of jest-mock-extended
    })
    afterEach(() => {
        toast.dismiss()
    })
    it('should render with contact form name', () => {
        renderView({ path: CONTACT_FORM_PREFERENCES_PATH })
        expect(screen.getByLabelText('Contact form name')).toHaveValue(
            ContactFormFixture.name,
        )
    })
    describe('when change store', () => {
        const shopName = 'My Shop'
        it('should render store selection dropdown when AI Agent enabled', () => {
            renderView({ path: CONTACT_FORM_PREFERENCES_PATH })
            expect(screen.getByLabelText('Connect a store')).toBeInTheDocument()
            expect(screen.getByLabelText('Connect a store')).not.toHaveValue()
        })
        it('should call API with new store', async () => {
            const fakeUpdate = jest.fn(() =>
                Promise.resolve(ContactFormFixture),
            )
            mockedUseContactFormApi.mockReturnValue({
                updateContactForm: fakeUpdate,
            } as unknown as ReturnType<typeof useContactFormApi>) // TODO: Discuss using of jest-mock-extended
            renderView({ path: CONTACT_FORM_PREFERENCES_PATH })
            // Selector should be enabled
            expect(screen.getByLabelText('Connect a store')).toBeEnabled()
            // Select the store
            userEvent.click(screen.getByLabelText('Connect a store'))
            userEvent.click(screen.getByText(shopName))
            await waitFor(() =>
                expect(screen.getByText('Save Changes')).toBeEnabled(),
            )
            userEvent.click(screen.getByText('Save Changes'))
            await waitFor(() =>
                expect(fakeUpdate).toHaveBeenCalledWith(FORM_ID, {
                    shop_name: shopName,
                    shop_integration_id: 1,
                }),
            )
        })
    })
    describe('onSave', () => {
        it('should show a success toast when updating the contact form succeeds', async () => {
            const updateContactForm = jest.fn(() =>
                Promise.resolve(ContactFormFixture),
            )
            mockedUseContactFormApi.mockReturnValue({
                isReady: true,
                updateContactForm,
            } as unknown as ReturnType<typeof useContactFormApi>)

            renderView({ path: CONTACT_FORM_PREFERENCES_PATH })

            userEvent.click(screen.getByLabelText('Connect a store'))
            userEvent.click(screen.getByText('My Shop'))
            await waitFor(() =>
                expect(screen.getByText('Save Changes')).toBeEnabled(),
            )
            userEvent.click(screen.getByText('Save Changes'))

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Contact form updated successfully',
                    }),
                ).toHaveAttribute('data-intent', 'success')
            })
        })
        it('should show an error toast when updating the contact form fails', async () => {
            const updateContactForm = jest.fn(() =>
                Promise.reject(new Error('boom')),
            )
            mockedUseContactFormApi.mockReturnValue({
                isReady: true,
                updateContactForm,
            } as unknown as ReturnType<typeof useContactFormApi>)

            renderView({ path: CONTACT_FORM_PREFERENCES_PATH })

            userEvent.click(screen.getByLabelText('Connect a store'))
            userEvent.click(screen.getByText('My Shop'))
            await waitFor(() =>
                expect(screen.getByText('Save Changes')).toBeEnabled(),
            )
            userEvent.click(screen.getByText('Save Changes'))

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to update the Contact Form',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
    describe('onDelete', () => {
        it('should show a success toast when deleting the contact form succeeds', async () => {
            const deleteContactForm = jest.fn(() => Promise.resolve(true))
            mockedUseContactFormApi.mockReturnValue({
                isReady: true,
                deleteContactForm,
            } as unknown as ReturnType<typeof useContactFormApi>)

            renderView({ path: CONTACT_FORM_PREFERENCES_PATH })

            userEvent.click(screen.getByText('Delete Form'))
            const confirmButtons = await screen.findAllByRole('button', {
                name: 'Delete Form',
            })
            userEvent.click(confirmButtons[confirmButtons.length - 1])

            await waitFor(() => {
                expect(deleteContactForm).toHaveBeenCalledWith(FORM_ID)
                expect(
                    screen.getByRole('status', {
                        name: 'Contact form deleted successfully',
                    }),
                ).toHaveAttribute('data-intent', 'success')
            })
        })
        it('should show the server error message when delete returns a 400 axios error', async () => {
            const axiosError = new AxiosError(
                'Bad Request',
                'ERR_BAD_REQUEST',
                undefined,
                undefined,
                {
                    status: 400,
                    statusText: 'Bad Request',
                    headers: {},
                    config: { headers: new AxiosHeaders() },
                    data: { message: 'Cannot delete the only contact form' },
                },
            )
            const deleteContactForm = jest.fn(() => Promise.reject(axiosError))
            mockedUseContactFormApi.mockReturnValue({
                isReady: true,
                deleteContactForm,
            } as unknown as ReturnType<typeof useContactFormApi>)

            renderView({ path: CONTACT_FORM_PREFERENCES_PATH })

            userEvent.click(screen.getByText('Delete Form'))
            const confirmButtons = await screen.findAllByRole('button', {
                name: 'Delete Form',
            })
            userEvent.click(confirmButtons[confirmButtons.length - 1])

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Cannot delete the only contact form',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
        it('should show the fallback error message when delete fails with a non-axios error', async () => {
            const deleteContactForm = jest.fn(() =>
                Promise.reject(new Error('Network down')),
            )
            mockedUseContactFormApi.mockReturnValue({
                isReady: true,
                deleteContactForm,
            } as unknown as ReturnType<typeof useContactFormApi>)

            renderView({ path: CONTACT_FORM_PREFERENCES_PATH })

            userEvent.click(screen.getByText('Delete Form'))
            const confirmButtons = await screen.findAllByRole('button', {
                name: 'Delete Form',
            })
            userEvent.click(confirmButtons[confirmButtons.length - 1])

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to delete the Contact Form',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
})
