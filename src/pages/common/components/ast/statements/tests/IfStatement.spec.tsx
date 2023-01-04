import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {List, Map, fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {rule} from 'fixtures/rule'

import IfStatement, {ConsequentStatement} from '../IfStatement'

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

describe('<ConsequentStatement/> component', () => {
    const minProps: ComponentProps<typeof ConsequentStatement> = {
        parent: List(),
        schemas: Map(),
        depth: 0,
        consequent: {},
        rule: Map(),
        actions: {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn(),
        },
    }

    it('should render', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <ConsequentStatement {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
