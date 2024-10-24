import {QueryClientProvider} from '@tanstack/react-query'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {emptyManagedRule} from 'fixtures/rule'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {user} from 'fixtures/users'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'
import {ManagedRulesSlugs} from 'state/rules/types'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

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

    it.each(Object.values(ManagedRulesSlugs))(
        '%s editor should render correctly',
        (slug) => {
            const {container} = render(
                <Provider store={store}>
                    <QueryClientProvider client={mockQueryClient()}>
                        <ManagedRuleEditor {...minProps} slug={slug} />
                    </QueryClientProvider>
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
