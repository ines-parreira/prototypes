import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {RootState} from 'state/types'

import {RuleLimitStatus} from 'state/rules/types'
import {emptyRule as ruleFixture} from 'fixtures/rule'

import {RulesList} from '../RulesList'

jest.mock('../../../../../state/entities/rules/actions')
jest.mock('../components/RuleRow', () => () => (
    <tr>
        <td></td>
        <td>name</td>
        <td></td>
        <td>last updated</td>
    </tr>
))

const createRuleFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        ...ruleFixture,
        id: i + 1,
    }))
}

const mockStore = configureMockStore([thunk])
const store = mockStore({billing: fromJS({plans: []})} as RootState)

describe('<RulesList/>', () => {
    const minProps: ComponentProps<typeof RulesList> = {
        limitStatus: RuleLimitStatus.NonReaching,
        rules: [],
        handleGoToLibrary: () => null,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the rule views', () => {
        const rules = createRuleFixtures(5)
        const {container} = render(
            <Provider store={store}>
                <RulesList {...minProps} rules={rules} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the upsell component', () => {
        const rules = createRuleFixtures(0)
        const {container} = render(
            <Provider store={store}>
                <RulesList {...minProps} rules={rules} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
