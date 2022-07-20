import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {basicPlan, starterPlan} from 'fixtures/subscriptionPlan'
import {billingState} from 'fixtures/billing'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {emptyManagedRule} from 'fixtures/rule'

import {RuleRecipeModal} from '../RuleRecipeModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('RuleRecipeModal', () => {
    const defaultState = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
                plan: basicPlan.id,
            },
        }),
        billing: fromJS({
            ...billingState,
            plans: fromJS({
                [basicPlan.id]: basicPlan,
                [starterPlan.id]: starterPlan,
            }),
        }),
        entities: {},
    } as RootState

    const minProps: ComponentProps<typeof RuleRecipeModal> = {
        recipe: {
            ...emptyRuleRecipeFixture,
            rule: emptyManagedRule,
        },
        handleInstall: jest.fn(),
        renderTags: jest.fn(),
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
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <RuleRecipeModal {...minProps} />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })
})
