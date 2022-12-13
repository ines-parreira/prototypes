import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
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
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <RuleRecipeModal {...minProps} />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })
})
