import { render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/constants'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'

import { getLocalesResponseFixture } from '../../fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import HelpCenterNewView from '../HelpCenterNewView'

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
    const emailIntegration = {
        id: 5,
        name: 'Acme Billing',
        type: IntegrationType.Email,
        meta: {
            address: 'billing@acme.gorgias.io',
        },
    }
    const renderComponent = () =>
        render(<HelpCenterNewView {...props} />, {
            storeState: {
                integrations: fromJS({
                    integrations: [emailIntegration],
                }),
            },
        })

    beforeEach(() => {
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
        const { findByTestId } = renderComponent()
        await findByTestId('name')
        expect(screen.getByText('Add Help Center')).toBeInTheDocument()
        expect(
            screen.getByText('Acme Billing <billing@acme.gorgias.io>'),
        ).toBeInTheDocument()
    })
    describe('Submit form', () => {
        it('should disable the submit button if all the required fields are not filled', async () => {
            const { findByRole, findByTestId } = renderComponent()
            const brandInput = await findByTestId('name')
            fireEvent.change(brandInput, { target: { value: 'My brand' } })
            fireEvent.change(brandInput, { target: { value: '' } })
            const submitButton = await findByRole('button', {
                name: /add help center/i,
            })
            expect(submitButton.className).toMatch(/disabled/i)
        })
        it('should enable the submit button when all the required fields are filled', async () => {
            const { findByRole, getByRole, findByTestId } = renderComponent()
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
            const { findByRole, findByTestId } = renderComponent()
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
            const { findByRole, findByTestId, getByRole } = renderComponent()
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
