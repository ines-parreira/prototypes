import type { ComponentProps } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
// oxlint-disable-next-line no-named-as-default
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { emptyManagedRule } from 'fixtures/rule'
import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { initialState as helpCenterInitialState } from 'state/entities/helpCenter/reducer'
import { ManagedRulesSlugs } from 'state/rules/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

// oxlint-disable-next-line no-named-as-default
import ManagedRuleEditor from '../ManagedRuleEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('hooks/aiAgent/useAiAgentAccess')

const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>

describe('<ManagedRuleEditor/>', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {
            ruleRecipes: {
                [ManagedRulesSlugs.AutoCloseSpam as string]:
                    emptyRuleRecipeFixture,
                [ManagedRulesSlugs.AutoReplyWismo as string]:
                    emptyRuleRecipeFixture,
            },
            helpCenter: helpCenterInitialState,
            selfServiceConfigurations: {},
        },
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
        integrations: fromJS({
            integrations: [
                {
                    type: 'shopify',
                    meta: {
                        shop_name: `my-shop`,
                    },
                },
            ],
        }),
        currentUser: fromJS(user),
    } as RootState)

    const renderManagedRuleEditor = (
        slug: ManagedRulesSlugs = ManagedRulesSlugs.AutoCloseSpam,
        additionalProps: Partial<ComponentProps<typeof ManagedRuleEditor>> = {},
    ) => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={mockQueryClient()}>
                    <ManagedRuleEditor
                        slug={slug}
                        rule={{
                            ...emptyManagedRule,
                            settings: { slug },
                        }}
                        handleDelete={jest.fn()}
                        handleSubmit={jest.fn()}
                        handleDirtyForm={jest.fn()}
                        isDeleting={false}
                        isSubmitting={false}
                        {...additionalProps}
                    />
                </QueryClientProvider>
            </Provider>,
        )
    }

    it.each(Object.values(ManagedRulesSlugs))(
        '%s editor should render correctly',
        (slug) => {
            renderManagedRuleEditor(slug)
            expect(
                screen.getByRole('button', { name: /update rule/i }),
            ).toBeInTheDocument()
            expect(screen.getByText('Enable rule')).toBeInTheDocument()
        },
    )

    describe('Automate access', () => {
        it('should allow AutoCloseSpam rule to have automate access even without AI Agent subscription', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            renderManagedRuleEditor(ManagedRulesSlugs.AutoCloseSpam)

            const submitButton = screen.getByRole('button', {
                name: /update rule/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'false')
        })

        it('should show subscription modal when toggling activation without automate access', async () => {
            const user = userEvent.setup()
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            renderManagedRuleEditor(ManagedRulesSlugs.AutoReplyWismo)

            const toggleButton = screen.getByRole('switch')
            await user.click(toggleButton)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /upgrade and reactivate/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should disable submit button without automate access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            renderManagedRuleEditor(ManagedRulesSlugs.AutoReplyWismo)

            const submitButton = screen.getByRole('button', {
                name: /update rule/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable submit button with automate access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderManagedRuleEditor(ManagedRulesSlugs.AutoReplyWismo)

            const submitButton = screen.getByRole('button', {
                name: /update rule/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'false')
        })
    })
})
