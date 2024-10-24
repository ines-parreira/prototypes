import {render, screen, fireEvent} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'

import {toJS} from 'utils'

import AddSiblingCondition from '../AddSiblingCondition'

describe('AddSiblingCondition component', () => {
    const commonProps = {
        parent: fromJS(['body', 0, 'test']),
    } as ComponentProps<typeof AddSiblingCondition>

    const modifyCodeAST = jest.fn()

    it('should render an option to add AND because existing operator is already AND ', () => {
        const rule = fromJS({
            code_ast: {body: [{test: {operator: '&&'}}]},
        }) as Map<any, any>

        render(
            <AddSiblingCondition
                {...commonProps}
                actions={{
                    modifyCodeAST,
                    getCondition: (path) =>
                        (rule.getIn(['code_ast'].concat(toJS(path))) as Map<
                            any,
                            any
                        >) || fromJS({}),
                }}
                rule={rule}
            />
        )

        const andButton = screen.getByRole('button', {name: /AND/i})
        expect(andButton).toBeInTheDocument()

        fireEvent.click(andButton)

        const dropdownItem = screen.getByRole('menuitem', {
            name: /Add\s+AND\s+condition/i,
        })
        expect(dropdownItem).toBeInTheDocument()

        fireEvent.click(dropdownItem)
        expect(modifyCodeAST).toHaveBeenCalledTimes(1)
    })

    it('should render an option to add OR because existing operator is already OR ', () => {
        const rule = fromJS({
            code_ast: {body: [{test: {operator: '||'}}]},
        }) as Map<any, any>

        render(
            <AddSiblingCondition
                {...commonProps}
                actions={{
                    modifyCodeAST,
                    getCondition: (path) =>
                        (rule.getIn(['code_ast'].concat(toJS(path))) as Map<
                            any,
                            any
                        >) || fromJS({}),
                }}
                rule={rule}
            />
        )

        const orButton = screen.getByRole('button', {name: /OR/i})
        expect(orButton).toBeInTheDocument()

        fireEvent.click(orButton)

        const dropdownItem = screen.getByRole('menuitem', {
            name: /Add\s+OR\s+condition/i,
        })
        expect(dropdownItem).toBeInTheDocument()

        fireEvent.click(dropdownItem)
        expect(modifyCodeAST).toHaveBeenCalledTimes(1)
    })
})
