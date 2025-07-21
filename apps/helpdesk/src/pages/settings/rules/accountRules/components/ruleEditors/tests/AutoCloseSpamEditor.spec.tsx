import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import { ManagedRulesSlugs } from 'state/rules/types'
import { RootState, StoreDispatch } from 'state/types'

import AutoCloseSpamEditor from '../AutoCloseSpamEditor'

describe('<AutoCloseSpamEditor/>', () => {
    const minProps: ComponentProps<typeof AutoCloseSpamEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoCloseSpam,
            allow_list: [],
            block_list: [],
        },
        onChange: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {
            ruleRecipes: {
                [ManagedRulesSlugs.AutoCloseSpam as string]:
                    emptyRuleRecipeFixture,
            },
        },
    } as RootState)

    it('should render correctly', () => {
        const { container } = render(
            <Provider store={store}>
                <AutoCloseSpamEditor {...minProps} />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
