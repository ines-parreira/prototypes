import userEvent from '@testing-library/user-event'
import React from 'react'
import {fromJS} from 'immutable'

import {render, screen} from '@testing-library/react'
import ActionSelect from '../ActionSelect'

const commonProps = {
    actions: {
        modifyCodeAST: jest.fn(),
        getCondition: jest.fn(),
    },
    parent: fromJS(['body', 0, 'expression']),
    value: 'addTags',
}

const nonSystemRule = fromJS({type: 'user'})
const systemRule = fromJS({type: 'system'})

describe('ActionSelect component', () => {
    it('should render all non-system actions for non-system rules', () => {
        const {container} = render(
            <ActionSelect {...commonProps} rule={nonSystemRule} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render all actions for system rules', () => {
        const {container} = render(
            <ActionSelect {...commonProps} rule={systemRule} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call actions.modifyCodeAST on click', () => {
        render(<ActionSelect {...commonProps} rule={nonSystemRule} />)

        userEvent.click(screen.getByRole('button'))
        userEvent.click(screen.getByRole('menuitem', {name: 'Add tags'}))

        expect(commonProps.actions.modifyCodeAST).toHaveBeenCalledWith(
            commonProps.parent,
            commonProps.value,
            'UPDATE'
        )
    })
})
