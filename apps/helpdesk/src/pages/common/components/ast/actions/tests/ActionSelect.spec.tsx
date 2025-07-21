import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import { userEvent } from 'utils/testing/userEvent'

import ActionSelect from '../ActionSelect'
import { actionsConfig } from '../config'

const commonProps = {
    actions: {
        modifyCodeAST: jest.fn(),
        getCondition: jest.fn(),
    },
    parent: fromJS(['body', 0, 'expression']),
    value: '' as const,
    rule: fromJS({ type: 'user' }),
}

const systemRule = fromJS({ type: 'system' })

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

describe('<ActionSelect />', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    it('should render `Select action` when value is empty', () => {
        render(<ActionSelect {...commonProps} />)

        expect(
            screen.getByRole('button', {
                name: 'Select action',
            }),
        ).toBeInTheDocument()
    })

    it('should render action in dropdown toggle', () => {
        render(<ActionSelect {...commonProps} value="addTags" />)

        expect(
            screen.getByRole('button', {
                name: 'Add tags',
            }),
        ).toBeInTheDocument()
    })

    it('should render all non-system actions for non-system rules', () => {
        mockUseFlag.mockReturnValue(true)
        render(<ActionSelect {...commonProps} />)

        fireEvent.click(screen.getByText('Select action'))

        Object.values(actionsConfig).filter((config) => {
            if (config.type !== 'system') {
                expect(
                    screen.getByRole('menuitem', {
                        name: config.name,
                    }),
                ).toBeInTheDocument()
            }
        })
    })

    it('should render all actions for system rules', () => {
        mockUseFlag.mockReturnValue(true)
        render(<ActionSelect {...commonProps} rule={systemRule} />)

        fireEvent.click(screen.getByText('Select action'))

        Object.values(actionsConfig).filter((config) => {
            expect(
                screen.getByRole('menuitem', {
                    name: config.name,
                }),
            ).toBeInTheDocument()
        })
    })

    it('should call actions.modifyCodeAST on click', () => {
        render(<ActionSelect {...commonProps} value="addTags" />)

        userEvent.click(screen.getByRole('button'))
        userEvent.click(screen.getByRole('menuitem', { name: 'Add tags' }))

        expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
            commonProps.parent,
            'addTags',
            'UPDATE',
        )
    })
})
