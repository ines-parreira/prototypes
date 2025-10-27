import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { emptyManagedRule, emptyRule as ruleFixture } from 'fixtures/rule'
import { user } from 'fixtures/users'
import { RuleLimitStatus } from 'state/rules/types'
import { RootState } from 'state/types'

import { RulesList } from '../RulesList'

jest.mock('../../../../../state/entities/rules/actions')
jest.mock('../components/RuleRow', () => () => (
    <tr>
        <td></td>
        <td>name</td>
        <td></td>
        <td>last updated</td>
    </tr>
))
jest.mock(
    '../../../billing/automate/AutomateSubscriptionModal',
    () => () => null,
)

const createRuleFixtures = (length: number) => {
    return Array.from({ length }, (_, i) => ({
        ...ruleFixture,
        id: i + 1,
    }))
}

const mockStore = configureMockStore([thunk])
const store = mockStore({
    currentAccount: fromJS(account),
    currentUser: fromJS(user),
    billing: fromJS(billingState),
} as RootState)

describe('<RulesList/>', () => {
    const minProps: ComponentProps<typeof RulesList> = {
        limitStatus: RuleLimitStatus.NonReaching,
        rules: [],
    }

    it('should render the rule views', () => {
        const rules = createRuleFixtures(5)
        const { container } = render(
            <Provider store={store}>
                <RulesList {...minProps} rules={rules} />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('it should not display managed rules', () => {
        const rules = [emptyManagedRule, ...createRuleFixtures(5)]
        render(
            <Provider store={store}>
                <RulesList {...minProps} rules={rules} />
            </Provider>,
        )
        expect(
            screen.queryByText(emptyManagedRule.name),
        ).not.toBeInTheDocument()
    })
})
