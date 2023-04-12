import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {ManagedRulesSlugs} from 'state/rules/types'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {emptyManagedRule} from 'fixtures/rule'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'
import {billingState} from 'fixtures/billing'
import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import ManagedRuleEditor from '../ManagedRuleEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('<ManagedRuleEditor/>', () => {
    const minProps: ComponentProps<typeof ManagedRuleEditor> = {
        slug: ManagedRulesSlugs.AutoCloseSpam,
        rule: {
            ...emptyManagedRule,
            settings: {slug: ManagedRulesSlugs.AutoCloseSpam},
        },
        handleDelete: jest.fn(),
        handleSubmit: jest.fn(),
        handleDirtyForm: jest.fn(),
        isDeleting: false,
        isSubmitting: false,
    }
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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each(Object.values(ManagedRulesSlugs))(
        '%s editor should render correctly',
        (slug) => {
            const {container} = render(
                <Provider store={store}>
                    <ManagedRuleEditor {...minProps} slug={slug} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
