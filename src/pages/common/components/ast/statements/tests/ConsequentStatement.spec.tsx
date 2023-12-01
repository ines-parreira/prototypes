import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {List, Map} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {ConsequentStatement} from '../ConsequentStatement'
import {statementReference} from '../statementReference'
import Statement from '../Statement'

statementReference.Statement = Statement
const mockStore = configureMockStore()
const defaultStore = {
    schemas: Map(),
}

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
