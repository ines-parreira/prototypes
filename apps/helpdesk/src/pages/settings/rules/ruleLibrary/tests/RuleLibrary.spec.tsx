import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { emptyManagedRule, rule as ruleFixture } from 'fixtures/rule'
import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { RuleRecipeTag } from 'models/ruleRecipe/types'
import { ManagedRulesSlugs } from 'state/rules/types'

import RuleLibrary from '../RuleLibrary'

jest.mock('hooks/aiAgent/useAiAgentAccess')

describe('<RuleLibrary/>', () => {
    const mockStore = configureMockStore([thunk])
    const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
        typeof useAiAgentAccess
    >
    const defaultStore = mockStore({
        entities: {},
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
        integrations: fromJS({ integrations: [] }),
    })
    const minProps: ComponentProps<typeof RuleLibrary> = {
        recipes: [
            {
                ...emptyRuleRecipeFixture,
                slug: 'foo',
                recipe_tag: RuleRecipeTag.AUTO_CLOSE,
            },
            {
                ...emptyRuleRecipeFixture,
                slug: 'bar',
                recipe_tag: RuleRecipeTag.AUTO_TAG,
            },
        ],
        searchTerm: '',
        isReady: true,
        rules: [ruleFixture],
    }

    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    describe('render', () => {
        it('should render cards for the library', () => {
            const { container } = render(
                <Provider store={defaultStore}>
                    <RuleLibrary {...minProps} />
                </Provider>,
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should filter cards for the library', () => {
            const { container } = render(
                <Provider store={defaultStore}>
                    <RuleLibrary {...minProps} />
                </Provider>,
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display badge for installed autoresponder', () => {
            const autoCloseSpamRule = {
                ...emptyRuleRecipeFixture,
                slug: ManagedRulesSlugs.AutoCloseSpam,
                rule: emptyManagedRule,
            }
            const props: ComponentProps<typeof RuleLibrary> = {
                recipes: [autoCloseSpamRule],
                rules: [emptyManagedRule],
                searchTerm: '',
                isReady: true,
            }

            const store = mockStore({
                entities: {
                    rules: {
                        [emptyManagedRule.id]: emptyManagedRule,
                    },
                    ruleRecepies: {
                        [autoCloseSpamRule.slug]: autoCloseSpamRule,
                    },
                },
                billing: fromJS(billingState),
                currentAccount: fromJS(account),
                integrations: fromJS({ integrations: [] }),
            })
            render(
                <Provider store={store}>
                    <RuleLibrary {...props} />
                </Provider>,
            )
            expect(screen.getByAltText('installed')).toBeInTheDocument()
        })
    })
})
