import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import {
    ruleUpdated,
    ruleDeleted,
    ruleAstUpdated,
    ruleCreated,
} from '../../../../../../../state/entities/rules/actions'

import {
    deleteRule,
    fetchRule,
    createRule,
} from '../../../../../../../models/rule/resources'

import {RuleItemContainer} from '../RuleItem'
import {getMomentUtcISOString} from '../../../../../../../utils/date'
import {emptyRule as ruleFixture} from '../../../../../../../fixtures/rule'

jest.mock('../../../../../../../state/entities/rules/actions')
jest.mock('../../../../../../../models/rule/resources')

describe('<RuleItem />', () => {
    const mockDate = jest.spyOn(global.Date, 'now').mockImplementation(() => 0)

    const ruleUpdatedMock = ruleUpdated as jest.MockedFunction<
        typeof ruleUpdated
    >
    const ruleDeletedMock = ruleDeleted as jest.MockedFunction<
        typeof ruleDeleted
    >
    const ruleCreatedMock = ruleCreated as jest.MockedFunction<
        typeof ruleCreated
    >
    const ruleAstUpdatedMock = ruleAstUpdated as jest.MockedFunction<
        typeof ruleAstUpdated
    >

    const createRuleMock = createRule as jest.MockedFunction<typeof createRule>
    const deleteRuleMock = deleteRule as jest.MockedFunction<typeof deleteRule>
    const fetchRuleMock = fetchRule as jest.MockedFunction<typeof fetchRule>

    const toggleOpeningMock = jest.fn()
    const notifyMock = jest.fn()

    const minProps: ComponentProps<typeof RuleItemContainer> = {
        rule: ruleFixture,
        toggleOpening: toggleOpeningMock,
        canDuplicate: true,
        onActivate: jest.fn(() => Promise.resolve()),
        onDeactivate: jest.fn(() => Promise.resolve()),
        ruleUpdated: ruleUpdatedMock,
        ruleDeleted: ruleDeletedMock,
        ruleCreated: ruleCreatedMock,
        ruleAstUpdated: ruleAstUpdatedMock,
        schemas: fromJS({}),
        notify: notifyMock,
    }

    const duplicatedRuleFixture = {
        ...ruleFixture,
        id: 2,
        name: `${ruleFixture.name} - copy`,
        deactivated_datetime: getMomentUtcISOString(),
    }

    createRuleMock.mockResolvedValue(duplicatedRuleFixture)
    fetchRuleMock.mockResolvedValue(ruleFixture)
    deleteRuleMock.mockResolvedValue()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        mockDate.mockRestore()
    })

    describe('rendering', () => {
        it('should render with an error when no trigger is selected', () => {
            const {queryByText} = render(
                <RuleItemContainer
                    {...minProps}
                    rule={{...ruleFixture, event_types: ''}}
                />
            )

            expect(
                queryByText(/you need to select at least one trigger/i)
            ).not.toBeNull()
        })

        it('should not render an error message when there is a least one trigger selected', () => {
            const {container} = render(<RuleItemContainer {...minProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should disable buttons when name is empty and render an error message', () => {
            const {getByText, queryByText} = render(
                <RuleItemContainer
                    {...minProps}
                    rule={{...ruleFixture, name: ''}}
                />
            )
            expect(queryByText('* Name cannot be empty')).not.toBeNull()
            expect(getByText(/save rule/i)).toMatchSnapshot()
            expect(getByText(/duplicate rule/i)).toMatchSnapshot()
        })
    })

    describe('`reset rule` button', () => {
        it('should reset event types', async () => {
            const {container, getByText} = render(
                <RuleItemContainer
                    {...minProps}
                    rule={{
                        ...ruleFixture,
                        event_types: 'ticket-created,ticket-updated',
                    }}
                />
            )
            fireEvent.click(getByText(/discard changes/i))
            fireEvent.click(getByText(/confirm/i))
            await waitFor(() => {
                expect(container.firstChild).toMatchSnapshot()
            })
        })
        it('should reset name', async () => {
            const newRuleName = 'new rule name'
            const {getByText, queryByDisplayValue} = render(
                <RuleItemContainer
                    {...minProps}
                    rule={{
                        ...ruleFixture,
                        name: newRuleName,
                    }}
                />
            )
            fireEvent.click(getByText(/discard changes/i))
            fireEvent.click(getByText(/confirm/i))
            await waitFor(() => {
                expect(queryByDisplayValue(ruleFixture.name)).not.toBeNull() // should be equal to mocked fetchRule value
            })
        })
        it('should reset description', async () => {
            const newDescription = 'my awesome new rule'
            const {getByText, queryByDisplayValue} = render(
                <RuleItemContainer
                    {...minProps}
                    rule={{
                        ...ruleFixture,
                        description: newDescription,
                    }}
                />
            )
            fireEvent.click(getByText(/discard changes/i))
            fireEvent.click(getByText(/confirm/i))
            await waitFor(() => {
                expect(
                    queryByDisplayValue(ruleFixture.description) // should be equal to mocked fetchRule value
                ).not.toBeNull()
            })
        })
    })

    describe('`duplicate rule` button', () => {
        it('should create a new rule, close the current one and open the new one', async () => {
            const {getByText} = render(<RuleItemContainer {...minProps} />)

            fireEvent.click(getByText(/duplicate rule/i))
            await waitFor(() => {
                expect(createRuleMock).toHaveBeenNthCalledWith(1, {
                    code: '',
                    code_ast: {},
                    deactivated_datetime: getMomentUtcISOString(),
                    description: 'foo',
                    event_types: 'ticket-created',
                    name: 'my rule - copy',
                })
                expect(ruleCreatedMock).toHaveBeenNthCalledWith(1, {
                    ...duplicatedRuleFixture,
                })
                expect(fetchRuleMock).toHaveBeenCalled()
                expect(toggleOpeningMock.mock.calls).toMatchSnapshot()
            })
        })

        it('should not duplicate a rule when maximum number of rules is reached and should notify of the reached limit', () => {
            const {getByText} = render(
                <RuleItemContainer {...minProps} canDuplicate={false} />
            )
            fireEvent.click(getByText(/duplicate rule/i))
            expect(createRuleMock).not.toHaveBeenCalled()
            expect(notifyMock).toHaveBeenNthCalledWith(1, {
                message:
                    'Your account has reached the rule limit. To add more rules, please delete any inactive rules.',
                status: 'error',
            })
        })

        it('should not add `- copy` at the end of the new rule name, when it is different from the initial one', async () => {
            const {getByDisplayValue, getByText} = render(
                <RuleItemContainer {...minProps} />
            )
            const name = 'WAYOU'
            const input = getByDisplayValue(ruleFixture.name)
            fireEvent.change(input, {target: {value: name}})
            fireEvent.click(getByText(/duplicate rule/i))

            await waitFor(() => {
                expect(createRuleMock).toHaveBeenCalledWith({
                    description: 'foo',
                    event_types: 'ticket-created',
                    name,
                    code: ruleFixture.code,
                    code_ast: ruleFixture.code_ast,
                    deactivated_datetime: getMomentUtcISOString(),
                })
            })
        })
    })
})
