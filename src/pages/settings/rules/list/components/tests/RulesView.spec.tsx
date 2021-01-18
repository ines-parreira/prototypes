import React, {ComponentProps, ReactNode} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Location} from 'history'
import {fromJS} from 'immutable'

import {RuleLimitStatus} from '../../../../../../state/rules/types'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import * as ruleActions from '../../../../../../state/rules/actions'
import {
    RULE_MAX_NUMBER,
    RULE_MAX_NUMBER_WARNING,
} from '../../../../../../state/rules/selectors'
import {RulesView} from '../RulesView'

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

const ruleFixture = {
    id: 1,
    description: 'foo',
    name: 'my rule',
    code_ast: {},
    code: {},
}

const createRuleFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        ...ruleFixture,
        id: i + 1,
    }))
}

describe('<RulesView/>', () => {
    const createMock = jest.fn()
    const fetchRulesMock: jest.MockedFunction<typeof ruleActions.fetchRules> = jest.fn()
    const updateOrderMock = jest.fn()
    const notifyMock = jest.fn()
    const defaultProps = ({
        create: createMock,
        fetchRules: fetchRulesMock,
        updateOrder: updateOrderMock,
        notify: notifyMock,
        location: {
            search: '',
        },
        rules: fromJS([]),
        limitStatus: RuleLimitStatus.NonReaching,
    } as any) as ComponentProps<typeof RulesView>

    beforeEach(() => {
        jest.clearAllMocks()
        fetchRulesMock.mockReturnValue(() => Promise.resolve())
    })

    it('should open a rule row because a ruleId is passed and fetch rules', () => {
        const rules = createRuleFixtures(3)
        const {container} = render(
            <RulesView
                {...defaultProps}
                rules={fromJS(rules)}
                location={({search: '?ruleId=3'} as unknown) as Location}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(
            (defaultProps.fetchRules as jest.Mock).mock.calls
        ).toMatchSnapshot()
    })

    it('should not open a rule row because no ruleId is passed', () => {
        const rules = createRuleFixtures(3)
        const {container} = render(
            <RulesView {...defaultProps} rules={fromJS(rules)} />
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(screen.queryByText('Opened Row')).toBeNull()
        expect(
            (defaultProps.fetchRules as jest.Mock).mock.calls
        ).toMatchSnapshot()
    })

    it('should render a warning when reaching the rule limit', () => {
        const rules = createRuleFixtures(RULE_MAX_NUMBER_WARNING)
        render(
            <RulesView
                {...defaultProps}
                rules={fromJS(rules)}
                limitStatus={RuleLimitStatus.Reaching}
            />
        )
        expect(screen.getByText('65 rules of 70')).not.toBe(null)
    })

    it('should render a warning when the rule limit has been reached and prevent the creation of a rule while notifying the user', () => {
        const rules = createRuleFixtures(RULE_MAX_NUMBER)
        const {getByText, getByTestId} = render(
            <RulesView
                {...defaultProps}
                rules={fromJS(rules)}
                limitStatus={RuleLimitStatus.Reached}
            />
        )
        expect(
            screen.getByText('Your account has reached the rule limit.')
        ).not.toBe(null)
        fireEvent.click(getByText('Create new rule'))
        fireEvent.click(getByTestId('create-rule'))
        expect(defaultProps.notify).toHaveBeenNthCalledWith(1, {
            message:
                'Your account has reached the rule limit. To add more rules, please delete any inactive rules.',
            status: NotificationStatus.Error,
        })
    })
})
