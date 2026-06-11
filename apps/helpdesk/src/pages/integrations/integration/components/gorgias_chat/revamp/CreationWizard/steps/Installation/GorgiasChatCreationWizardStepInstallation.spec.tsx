import type React from 'react'

import { render } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'

import {
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import { Wizard } from 'pages/common/components/wizard/Wizard'
import * as actions from 'state/integrations/actions'

import { GorgiasChatCreationWizardStepInstallation } from './GorgiasChatCreationWizardStepInstallation'

jest.mock('pages/common/hooks/useIsIntersectingWithBrowserViewport', () => ({
    useIsIntersectingWithBrowserViewport: () => false,
}))

const mockStore = configureMockStore([thunk])

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    agents: fromJS({
        all: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: { name: 'admin' },
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: { name: 'agent' },
            },
        ],
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'Test Store',
            },
        ],
    }),
}

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    type: IntegrationType.GorgiasChat,
    decoration: {},
    meta: {
        wizard: {
            status: GorgiasChatCreationWizardStatus.Draft,
            step: GorgiasChatCreationWizardSteps.Installation,
        },
    },
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepInstallation
> = {
    integration,
    isSubmitting: false,
}

const renderComponent = (
    props: Partial<
        React.ComponentProps<typeof GorgiasChatCreationWizardStepInstallation>
    > = {},
    storeState = mockStoreState,
) => {
    return render(
        <MemoryRouter>
            <Provider store={mockStore(storeState)}>
                <Wizard steps={[GorgiasChatCreationWizardSteps.Installation]}>
                    <GorgiasChatCreationWizardStepInstallation
                        {...minProps}
                        {...props}
                    />
                </Wizard>
            </Provider>
        </MemoryRouter>,
    )
}

describe('<GorgiasChatCreationWizardStepInstallation />', () => {
    it('renders manual installation selected by default when no store is connected', () => {
        const { getByLabelText } = renderComponent()

        expect(
            getByLabelText('Install manually', { selector: 'input' }),
        ).toBeChecked()
    })

    it('renders 1-click installation selected when shopify store is connected', () => {
        const { getByLabelText } = renderComponent({
            integration: integration.setIn(['meta', 'shop_integration_id'], 1),
        })

        expect(
            getByLabelText(/install for Shopify/i, {
                selector: 'input',
            }),
        ).toBeChecked()
    })

    it('renders navigation buttons', () => {
        const { getByRole } = renderComponent()

        expect(
            getByRole('button', { name: 'Save & Install Later' }),
        ).toBeInTheDocument()
        expect(getByRole('button', { name: 'Back' })).toBeInTheDocument()
        expect(
            getByRole('button', { name: 'Install Manually' }),
        ).toBeInTheDocument()
    })

    it('disables buttons when submitting form', () => {
        const { getByRole } = renderComponent({ isSubmitting: true })

        expect(
            getByRole('button', { name: 'Save & Install Later' }),
        ).toBeAriaDisabled()
        expect(getByRole('button', { name: 'Back' })).toBeAriaDisabled()
    })

    it('submits form with correct data when using 1-click installation for Shopify', async () => {
        const { getByRole } = renderComponent({
            integration: integration.setIn(['meta', 'shop_integration_id'], 1),
        })

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        await act(() =>
            userEvent.click(getByRole('button', { name: /^Install$/ })),
        )

        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1)
        })

        const [formData] = spy.mock.calls[0]
        const form = formData.toJS()

        expect(form.meta.wizard.status).toBe(
            GorgiasChatCreationWizardStatus.Published,
        )
        expect(form.meta.wizard.installation_method).toBe(
            GorgiasChatCreationWizardInstallationMethod.OneClick,
        )
    })

    it('submits form with correct data when using manual installation', async () => {
        const { getByRole } = renderComponent()

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        await act(() =>
            userEvent.click(getByRole('button', { name: 'Install Manually' })),
        )

        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1)
        })

        const [formData] = spy.mock.calls[0]
        const form = formData.toJS()

        expect(form.meta.wizard.status).toBe(
            GorgiasChatCreationWizardStatus.Published,
        )
        expect(form.meta.wizard.installation_method).toBe(
            GorgiasChatCreationWizardInstallationMethod.Manual,
        )
    })

    it('shows an error toast when the install fails', async () => {
        const apiError = {
            response: {
                data: {
                    error: {
                        msg: "There's already a chat installed on this store",
                    },
                },
            },
        }

        const updateSpy = jest
            .spyOn(actions, 'updateOrCreateIntegration')
            .mockImplementationOnce(
                (() => () => Promise.reject(apiError)) as any,
            )
        const toastSpy = jest
            .spyOn(toast, 'error')
            .mockImplementation(jest.fn())

        const { getByRole } = renderComponent()

        await act(() =>
            userEvent.click(getByRole('button', { name: 'Install Manually' })),
        )

        await waitFor(() => {
            expect(updateSpy).toHaveBeenCalledTimes(1)
        })

        expect(toastSpy).toHaveBeenCalledWith(
            "There's already a chat installed on this store",
        )
    })

    it('invokes the onSuccess callback that handles redirect and event log', async () => {
        const updateSpy = jest
            .spyOn(actions, 'updateOrCreateIntegration')
            .mockImplementationOnce(((
                _integration: any,
                _action: any,
                _disableRedirect: any,
                onSuccess?: (resp: any) => void,
            ) =>
                () => {
                    onSuccess?.({ id: 1 })
                    return Promise.resolve()
                }) as any)

        const { getByRole } = renderComponent({
            integration: integration.setIn(['meta', 'shop_integration_id'], 1),
        })

        await act(() =>
            userEvent.click(getByRole('button', { name: /^Install$/ })),
        )

        await waitFor(() => {
            expect(updateSpy).toHaveBeenCalledTimes(1)
        })

        const [, , , onSuccess] = updateSpy.mock.calls[0]
        expect(typeof onSuccess).toBe('function')
    })

    it('runs Save & Install Later through the wizard event branch', async () => {
        const updateSpy = jest
            .spyOn(actions, 'updateOrCreateIntegration')
            .mockImplementationOnce(((
                _integration: any,
                _action: any,
                _disableRedirect: any,
                onSuccess?: (resp: any) => void,
            ) =>
                () => {
                    onSuccess?.({ id: 1 })
                    return Promise.resolve()
                }) as any)

        const { getByRole } = renderComponent()

        await act(() =>
            userEvent.click(
                getByRole('button', { name: 'Save & Install Later' }),
            ),
        )

        await waitFor(() => {
            expect(updateSpy).toHaveBeenCalledTimes(1)
        })
    })
})
