import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import {RuleLimitStatus} from '../../../../../../state/rules/types'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import {ruleCreated} from '../../../../../../state/entities/rules/actions'
import {createRule} from '../../../../../../models/rule/resources'
import {emptyRule as ruleFixture} from '../../../../../../fixtures/rule'
import {RuleFormContainer} from '../RuleForm'

jest.mock('../../../../../../models/rule/resources')
jest.mock('../../../../../../state/entities/rules/actions')

describe('<RuleForm />', () => {
    const ruleCreatedMock = ruleCreated as jest.MockedFunction<
        typeof ruleCreated
    >
    const notify = jest.fn()
    const onSubmit = jest.fn()
    const onCancel = jest.fn()

    const createRuleMock = createRule as jest.MockedFunction<typeof createRule>
    createRuleMock.mockResolvedValue(ruleFixture)

    const minProps: ComponentProps<typeof RuleFormContainer> = {
        limitStatus: RuleLimitStatus.NonReaching,
        ruleCreated: ruleCreatedMock,
        onSubmit,
        onCancel,
        notify,
    }

    beforeEach(() => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => 0)
        jest.clearAllMocks()
    })

    it('should render the empty form', () => {
        const {container} = render(<RuleFormContainer {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should create the rule when the limit is not reached', async () => {
        const {getByText, getByLabelText} = render(
            <RuleFormContainer {...minProps} />
        )
        const nameInput = getByLabelText('Name')
        fireEvent.change(nameInput, {target: {value: 'new rule'}})
        fireEvent.click(getByText(/create rule/i))
        await waitFor(() => {
            expect(createRuleMock.mock.calls).toMatchSnapshot()
            expect(ruleCreated).toHaveBeenNthCalledWith(1, ruleFixture)
        })
    })

    it('should notify when the rule limit is reached', async () => {
        const {getByText, getByLabelText} = render(
            <RuleFormContainer
                {...minProps}
                limitStatus={RuleLimitStatus.Reached}
            />
        )
        const nameInput = getByLabelText('Name')
        fireEvent.change(nameInput, {target: {value: 'new rule'}})
        fireEvent.click(getByText(/create rule/i))
        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message:
                    'Your account has reached the rule limit. To add more rules, please delete any inactive rules.',
                status: NotificationStatus.Error,
            })
            expect(createRuleMock).not.toHaveBeenCalled()
        })
    })
})
