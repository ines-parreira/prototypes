import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import RuleItem from '../RuleItem'
import {getMomentUtcISOString} from '../../../../../../../utils/date.ts'

const defaultProps = {
    rule: fromJS({
        id: 17,
        description: 'foo',
        name: 'my rule',
        code_ast: {},
        code: {},
    }),
    actions: {
        rules: {
            modifyCodeAst: jest.fn(),
            create: jest.fn(() => Promise.resolve({rule: {id: 12}})),
            reset: jest.fn(() => Promise.resolve()),
        },
    },
    toggleOpening: jest.fn(),
}

describe('<RuleItem />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(global.Date, 'now').mockImplementation(() => 0) // ConfirmButton generates ids based on the date
    })

    afterEach(() => {
        global.Date.now.mockRestore()
    })

    describe('rendering', () => {
        it('should render with default state', () => {
            const {container} = render(<RuleItem {...defaultProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render an error message when there is a least one trigger selected', () => {
            const rule = fromJS({
                id: 17,
                description: 'foo',
                name: 'my rule',
                code_ast: {},
                code: {},
                event_types: 'ticket-created',
            })
            const {container} = render(
                <RuleItem {...defaultProps} rule={rule} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('`duplicate rule` button', () => {
        it('should create a new rule, close the current one and open the new one', async () => {
            const rule = fromJS({
                id: 17,
                description: 'foo',
                name: 'my rule',
                code_ast: {},
                code: {},
                event_types: 'ticket-created',
            })
            const {getByText} = render(
                <RuleItem {...defaultProps} rule={rule} />
            )

            fireEvent.click(getByText(/duplicate rule/i))
            expect(defaultProps.actions.rules.create).toHaveBeenCalledWith({
                description: 'foo',
                event_types: 'ticket-created',
                name: `${rule.get('name')} - copy`,
                code: rule.get('code'),
                code_ast: rule.get('code_ast'),
                deactivated_datetime: getMomentUtcISOString(),
            })
            await waitFor(() => {
                expect(defaultProps.toggleOpening).toHaveBeenCalledWith(17) // old rule
                expect(defaultProps.toggleOpening).toHaveBeenCalledWith(12) // new rule
            })
        })

        it('should not add `- copy` at the end of the new rule name, when it is different from the initial one', () => {
            const rule = fromJS({
                id: 17,
                description: 'foo',
                name: 'my rule',
                code_ast: {},
                code: {},
                event_types: 'ticket-created',
            })
            const {getByDisplayValue, getByText} = render(
                <RuleItem {...defaultProps} rule={rule} />
            )
            const name = 'WAYOU'
            const input = getByDisplayValue(rule.get('name'))
            fireEvent.change(input, {target: {value: name}})
            fireEvent.click(getByText(/duplicate rule/i))

            expect(defaultProps.actions.rules.create).toHaveBeenCalledWith({
                description: 'foo',
                event_types: 'ticket-created',
                name,
                code: rule.get('code'),
                code_ast: rule.get('code_ast'),
                deactivated_datetime: getMomentUtcISOString(),
            })
        })
    })
})
