import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { emptyManagedRule } from 'fixtures/rule'
import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import type { ManagedRuleSettings } from 'state/rules/types'
import { RootState, StoreDispatch } from 'state/types'

import { RuleRecipeModal } from '../RuleRecipeModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('RuleRecipeModal', () => {
    const defaultState = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
            },
        }),
        billing: fromJS(billingState),
        entities: {},
    } as RootState

    const minProps: ComponentProps<typeof RuleRecipeModal> = {
        recipe: {
            ...emptyRuleRecipeFixture,
            rule: emptyManagedRule,
        },
        handleInstall: jest.fn(),
        handleRule: {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn(),
        },
        isOpen: true,
        onToggle: jest.fn(),
        shouldInstall: true,
        handleDefaultSettings: jest.fn(),
        shouldHandleError: false,
    }

    it('should render the modal', () => {
        const { baseElement } = render(
            <Provider store={mockStore(defaultState)}>
                <RuleRecipeModal {...minProps} />
            </Provider>,
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render "Install" button on auto-close-spam rule', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <RuleRecipeModal
                    {...minProps}
                    recipe={{
                        ...minProps.recipe,
                        rule: {
                            ...minProps.recipe.rule,
                            settings: {
                                ...minProps.recipe.rule.settings,
                                slug: 'non-support-related-emails',
                            } as ManagedRuleSettings,
                        },
                    }}
                />
            </Provider>,
        )
        expect(screen.getByText(/Install rule/)).toBeInTheDocument()
    })
})
