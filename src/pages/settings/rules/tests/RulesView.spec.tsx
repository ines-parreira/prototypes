import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {RuleLimitStatus} from '../../../../state/rules/types'
import {
    RULE_MAX_NUMBER_WARNING,
    RULE_MAX_NUMBER,
} from '../../../../state/entities/rules/selectors'
import {rulesFetched} from '../../../../state/entities/rules/actions'
import {fetchRules} from '../../../../models/rule/resources'
import {emptyRule as ruleFixture} from '../../../../fixtures/rule'

import {RulesViewContainer} from '../RulesView'

jest.mock('../../../../models/rule/resources')
jest.mock('../../../../state/entities/rules/actions')
jest.mock('../components/RulesTable', () => () => {
    return <div></div>
})

const createRuleFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        ...ruleFixture,
        id: i + 1,
    }))
}

describe('<RulesView/>', () => {
    const rulesFetchedMock = rulesFetched as jest.MockedFunction<
        typeof rulesFetched
    >
    const fetchRulesMock = fetchRules as jest.MockedFunction<typeof fetchRules>

    const notifyMock = jest.fn()

    const minProps: ComponentProps<typeof RulesViewContainer> = {
        limitStatus: RuleLimitStatus.NonReaching,
        rulesFetched: rulesFetchedMock,
        notify: notifyMock,
        rules: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render the rule views', () => {
        const rules = createRuleFixtures(5)
        const {container} = render(
            <RulesViewContainer {...minProps} rules={rules} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch rules', () => {
        render(<RulesViewContainer {...minProps} />)
        expect(fetchRulesMock).toHaveBeenCalled()
    })

    it('should render a warning when reaching the rule limit', () => {
        const rules = createRuleFixtures(RULE_MAX_NUMBER_WARNING)
        const {getByText} = render(
            <RulesViewContainer
                {...minProps}
                rules={rules}
                limitStatus={RuleLimitStatus.Reaching}
            />
        )
        expect(getByText('65 rules of 70')).not.toBe(null)
    })

    it('should render an error when reached the rule limit', () => {
        const rules = createRuleFixtures(RULE_MAX_NUMBER)
        const {getByText} = render(
            <RulesViewContainer
                {...minProps}
                rules={rules}
                limitStatus={RuleLimitStatus.Reached}
            />
        )
        expect(getByText(/your account has reached the rule limit/i)).not.toBe(
            null
        )
    })
})
