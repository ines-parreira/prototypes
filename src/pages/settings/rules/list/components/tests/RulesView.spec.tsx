import React, {ComponentProps, ReactNode} from 'react'
import {render, screen, waitFor} from '@testing-library/react'

import {Rule, RuleLimitStatus} from '../../../../../../state/rules/types'
import {RULE_MAX_NUMBER_WARNING} from '../../../../../../state/entities/rules/selectors'
import {
    rulesFetched,
    rulesReordered,
} from '../../../../../../state/entities/rules/actions'
import {fetchRules} from '../../../../../../models/rule/resources'
import {emptyRule as ruleFixture} from '../../../../../../fixtures/rule'
import {ApiListResponsePagination} from '../../../../../../models/api/types'

import {RulesViewContainer} from '../RulesView'

jest.mock('../RuleRow/RuleRow', () => ({isOpen}: {isOpen: boolean}) => {
    if (!isOpen) {
        return (
            <tr>
                <td>Closed Row</td>
            </tr>
        )
    }
    return (
        <tr>
            <td>Opened Row</td>
        </tr>
    )
})

jest.mock(
    '../../../../../common/components/Modal',
    () => ({isOpen, children}: {isOpen: boolean; children: ReactNode}) => {
        if (isOpen) {
            return children
        }
        return null
    }
)

jest.mock(
    '../RuleForm',
    () => ({onSubmit}: {onSubmit: () => Promise<void>}) => {
        const handleSubmit = () => {
            return onSubmit().catch((e: undefined) => e)
        }
        return (
            <div>
                <button
                    data-testid="create-rule"
                    onClick={handleSubmit}
                    value="create rule"
                />
            </div>
        )
    }
)

jest.mock('../../../../../../models/rule/resources')
jest.mock('../../../../../../state/entities/rules/actions')

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
    const rulesReorderedMock = rulesReordered as jest.MockedFunction<
        typeof rulesReordered
    >

    const fetchRulesMock = fetchRules as jest.MockedFunction<typeof fetchRules>
    fetchRulesMock.mockResolvedValue(
        ([] as unknown) as ApiListResponsePagination<Rule[]>
    )

    const notifyMock = jest.fn()

    const minProps: ComponentProps<typeof RulesViewContainer> = {
        limitStatus: RuleLimitStatus.NonReaching,
        rulesFetched: rulesFetchedMock,
        rulesReordered: rulesReorderedMock,
        notify: notifyMock,
        location: {search: ''},
        rules: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should open a rule row because a ruleId is passed and fetch rules', async () => {
        const rules = createRuleFixtures(3)
        const {container} = render(
            <RulesViewContainer
                {...minProps}
                rules={rules}
                location={{...location, search: '?ruleId=3'}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(fetchRulesMock).toHaveBeenCalled()
        await waitFor(() => {
            expect(rulesFetchedMock).toHaveBeenCalled()
        })
    })

    it('should not open a rule row because no ruleId is passed', async () => {
        const rules = createRuleFixtures(3)
        const {container} = render(
            <RulesViewContainer {...minProps} rules={rules} />
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(screen.queryByText('Opened Row')).toBeNull()
        await waitFor(() => {
            expect(rulesFetchedMock).toHaveBeenCalled()
        })
    })

    it('should render a warning when reaching the rule limit', () => {
        const rules = createRuleFixtures(RULE_MAX_NUMBER_WARNING)
        render(
            <RulesViewContainer
                {...minProps}
                rules={rules}
                limitStatus={RuleLimitStatus.Reaching}
            />
        )
        expect(screen.getByText('65 rules of 70')).not.toBe(null)
    })
})
