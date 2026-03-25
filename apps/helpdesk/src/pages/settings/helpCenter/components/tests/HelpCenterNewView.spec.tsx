import React from 'react'

import { history } from '@repo/routing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState, StoreDispatch } from 'state/types'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { renderWithRouter } from 'utils/testing'

import { getLocalesResponseFixture } from '../../fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import HelpCenterNewView from '../HelpCenterNewView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState),
}
const store = mockStore(defaultState)

const mockCheckHelpCenterWithSubdomainExists = jest.fn()
const mockCreateHelpCenter = jest.fn()
const mockIsPassingRuleCheck = jest.fn()
jest.mock('../../hooks/useHelpCenterApi', () => {
    return {
        useAbilityChecker: () => ({
            isPassingRulesCheck: mockIsPassingRuleCheck,
        }),
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                checkHelpCenterWithSubdomainExists:
                    mockCheckHelpCenterWithSubdomainExists,
                createHelpCenter: mockCreateHelpCenter,
            },
        }),
    }
})

jest.mock('../../hooks/useShopifyStoreWithChatConnectionsOptions', () => {
    return {
        useShopifyStoreWithChatConnectionsOptions: jest
            .fn()
            .mockReturnValue([]),
    }
})

jest.mock('../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)

const mockEnableArticleRecommendation = jest.fn()
jest.mock('../../hooks/useEnableArticleRecommendation', () => ({
    useEnableArticleRecommendation: () => mockEnableArticleRecommendation,
}))

jest.mock('state/notifications/actions', () => ({
    notify: () => ({ type: 'test' }),
}))

describe('<HelpCenterNewView />', () => {
    const props = {}

    beforeEach(() => {
        history.push = jest.fn()
        mockFeatureFlags({})
        mockCheckHelpCenterWithSubdomainExists.mockResolvedValue(true)
        mockCreateHelpCenter.mockResolvedValue({ data: {} })
        mockIsPassingRuleCheck.mockReturnValue(true)
        mockEnableArticleRecommendation.mockReturnValue({})
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    it('should render the component', async () => {
        const { container, findByTestId } = renderWithRouter(
            <Provider store={store}>
                <HelpCenterNewView {...props} />
            </Provider>,
        )
        await findByTestId('name')
        expect(container).toMatchSnapshot()
    })

    describe('Submit form', () => {
        it('should disable the submit button if all the required fields are not filled', async () => {
            const { findByRole, findByTestId } = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>,
            )
            const brandInput = await findByTestId('name')
            fireEvent.change(brandInput, { target: { value: 'My brand' } })
            fireEvent.change(brandInput, { target: { value: '' } })
            const submitButton = await findByRole('button', {
                name: /add help center/i,
            })
            expect(submitButton.className).toMatch(/disabled/i)
        })

        it('should enable the submit button when all the required fields are filled', async () => {
            const { findByRole, getByRole, findByTestId } = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>,
            )

            const brandInput = await findByTestId('name')
            fireEvent.change(brandInput, { target: { value: 'My brand' } })

            const subdomainInput = getByRole('textbox', {
                name: /subdomain/i,
            }) as HTMLInputElement

            expect(subdomainInput.value).toEqual('my-brand')

            fireEvent.change(subdomainInput, {
                target: { value: 'custom-subdomain' },
            })
            fireEvent.change(brandInput, {
                target: { value: 'My custom brand' },
            })

            expect(subdomainInput.value).toEqual('custom-subdomain')

            const submitButton = await findByRole('button', {
                name: /add help center/i,
            })
            expect(submitButton.className).not.toMatch(/disabled/i)
        })

        it('should have an error message if brand name is one character long', async () => {
            const { findByRole, findByTestId } = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>,
            )

            const brandInput = (await findByTestId('name')) as HTMLInputElement
            fireEvent.change(brandInput, { target: { value: 'M' } })
            const submitButton = await findByRole('button', {
                name: /add help center/i,
            })
            expect(brandInput.value).toEqual('M')
            screen.getByText(/Name should be at least 2 characters long/i)
            expect(submitButton.className).toMatch(/disabled/i)
        })

        it('should call helpcenter API on submit a new help center', async () => {
            const { findByRole, findByTestId, getByRole } = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>,
            )
            const brandInput = await findByTestId('name')
            const subdomainInput = getByRole('textbox', { name: 'Subdomain' })
            const submitButton = await findByRole('button', {
                name: /add help center/i,
            })

            await act(async () => {
                await waitFor(() => {
                    fireEvent.change(brandInput, {
                        target: { value: 'My brand' },
                    })
                    fireEvent.change(subdomainInput, {
                        target: { value: 'acme' },
                    })
                })

                fireEvent.click(submitButton)

                expect(mockCreateHelpCenter).toHaveBeenLastCalledWith(
                    null,
                    expect.objectContaining({
                        default_locale: 'en-US',
                        email_integration: {
                            email: 'billing@acme.gorgias.io',
                            id: 5,
                        },
                        name: 'My brand',
                        primary_color: '#4A8DF9',
                        shop_name: undefined,
                        subdomain: 'acme',
                        theme: 'light',
                    }),
                )
            })
        })
    })
})
