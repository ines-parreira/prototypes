import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {RuleLimitStatus} from '../../../../../state/rules/types'
import {rulesReordered} from '../../../../../state/entities/rules/actions'
import {emptyRule as ruleFixture} from '../../../../../fixtures/rule'

import {RulesTable} from '../RulesTable'

jest.mock('../../../../../state/entities/rules/actions')
jest.mock('../RuleRow', () => () => (
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

describe('<RulesView/>', () => {
    const rulesReorderedMock = rulesReordered as jest.MockedFunction<
        typeof rulesReordered
    >
    const notifyMock = jest.fn()

    const minProps: ComponentProps<typeof RulesTable> = {
        limitStatus: RuleLimitStatus.NonReaching,
        rulesReordered: rulesReorderedMock,
        notify: notifyMock,
        rules: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render the rule views', () => {
        const rules = createRuleFixtures(5)
        const {container} = render(<RulesTable {...minProps} rules={rules} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
