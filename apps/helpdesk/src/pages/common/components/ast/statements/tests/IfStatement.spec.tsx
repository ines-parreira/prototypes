import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { rule } from 'fixtures/rule'
import { RuleContext } from 'pages/common/hooks/rule/RuleProvider'

import Expression from '../../expression/Expression'
import IfStatement from '../IfStatement'
import Statement from '../Statement'

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
        const { container } = render(
            <Provider store={mockStore(defaultStore)}>
                <RuleContext.Provider value={{ Expression, Statement }}>
                    <IfStatement {...minProps} />
                </RuleContext.Provider>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render alternate because there is one', () => {
        const { container } = render(
            <Provider store={mockStore(defaultStore)}>
                <RuleContext.Provider value={{ Expression, Statement }}>
                    <IfStatement
                        {...minProps}
                        alternate={{
                            parent: fromJS(['body', 0, 'expression']),
                        }}
                    />
                </RuleContext.Provider>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
