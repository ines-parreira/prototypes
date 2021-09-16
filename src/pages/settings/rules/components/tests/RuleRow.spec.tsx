import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import history from '../../../../history'
import {emptyRule as ruleFixture} from '../../../../../fixtures/rule'
import {createRule, deleteRule} from '../../../../../models/rule/resources'
import {
    ruleCreated,
    ruleDeleted,
    ruleUpdated,
} from '../../../../../state/entities/rules/actions'

import {RuleRow} from '../RuleRow'

jest.mock('../../../../../models/rule/resources')
jest.mock('../../../../history')
jest.mock('../../../../../state/entities/rules/actions')

describe('<RuleRow />', () => {
    const notifyMock = jest.fn()
    const ruleCreatedMock = ruleCreated as jest.MockedFunction<
        typeof ruleCreated
    >
    const ruleDeletedMock = ruleDeleted as jest.MockedFunction<
        typeof ruleDeleted
    >
    const ruleUpdatedMock = ruleUpdated as jest.MockedFunction<
        typeof ruleUpdated
    >

    const createRuleMock = createRule as jest.MockedFunction<typeof createRule>
    const deleteRuleMock = deleteRule as jest.MockedFunction<typeof deleteRule>

    const minProps: ComponentProps<typeof RuleRow> = {
        rule: ruleFixture,
        canDuplicate: true,
        ruleCreated: ruleCreatedMock,
        ruleDeleted: ruleDeletedMock,
        ruleUpdated: ruleUpdatedMock,
        notify: notifyMock,
    }
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render a row with a rule', () => {
        const {container} = render(<RuleRow {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should show description on hover', async () => {
        const {getByText, queryByText} = render(<RuleRow {...minProps} />)
        fireEvent.mouseEnter(getByText(ruleFixture.name))
        await waitFor(() => {
            const popoverHeader = queryByText(/rule description/i)
            expect(popoverHeader).not.toBeNull()
        })
    })
    it('should not show description on hover if rule has no description', async () => {
        const rule = {...ruleFixture, description: ''}

        const {getByText, queryByText} = render(
            <RuleRow {...minProps} rule={rule} />
        )
        fireEvent.mouseEnter(getByText(rule.name))
        await waitFor(() => {
            const popoverHeader = queryByText(/rule description/i)
            expect(popoverHeader).toBeNull()
        })
    })
    it('should duplicate rule and redirect on click', async () => {
        createRuleMock.mockResolvedValue(ruleFixture)
        const {getByText} = render(<RuleRow {...minProps} />)
        fireEvent.click(getByText(/file_copy/i))
        await waitFor(() => {
            expect(ruleCreatedMock).toHaveBeenCalled()
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/settings/rules/1'
            )
        })
    })
    it('should prompt confirm and then delete rule on click', async () => {
        deleteRuleMock.mockResolvedValue()
        const {getByText} = render(<RuleRow {...minProps} />)
        fireEvent.click(getByText(/delete/i))
        fireEvent.click(getByText(/confirm/i))
        await waitFor(() => {
            expect(ruleDeletedMock).toHaveBeenCalled()
        })
    })
    it('should deactivate on toggle button', async () => {
        const {getByText, getByRole} = render(<RuleRow {...minProps} />)
        fireEvent.click(getByRole('checkbox'))
        fireEvent.click(getByText(/confirm/i))
        await waitFor(() => {
            expect(ruleUpdatedMock).toHaveBeenCalled()
        })
    })
    it('should activate on toggle button', async () => {
        const deactivatedRule = {
            ...ruleFixture,
            deactivated_datetime: '2020-01-01T00:00:00',
        }
        const {getByRole} = render(
            <RuleRow {...minProps} rule={deactivatedRule} />
        )
        fireEvent.click(getByRole('checkbox'))
        await waitFor(() => {
            expect(ruleUpdatedMock).toHaveBeenCalled()
        })
    })
})
