import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Map, fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {rule} from 'fixtures/rule'

import Statement from '../Statement'
import {statementReference} from '../statementReference'

import IfStatement from '../IfStatement'

statementReference.Statement = Statement

const mockStore = configureMockStore()
const defaultStore = {
    schemas: Map(),
}

describe('IfStatement component', () => {
    const minProps: ComponentProps<typeof IfStatement> = {
        test: {},
        consequent: {},
        schemas: Map(),
        parent: fromJS(['body', 0, 'expression']),
        rule: fromJS(rule),
        actions: {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn().mockReturnValue(Map()),
        },
        depth: 0,
    }

    it('should not render alternate because there is none', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <IfStatement {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render alternate because there is one', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <IfStatement
                    {...minProps}
                    alternate={{
                        parent: fromJS(['body', 0, 'expression']),
                    }}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
