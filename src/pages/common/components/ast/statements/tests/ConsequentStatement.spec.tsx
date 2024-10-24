import {render} from '@testing-library/react'
import {List, Map} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RuleContext} from 'pages/common/hooks/rule/RuleProvider'

import Expression from '../../expression/Expression'
import {ConsequentStatement} from '../ConsequentStatement'
import Statement from '../Statement'

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
                <RuleContext.Provider value={{Expression, Statement}}>
                    <ConsequentStatement {...minProps} />
                </RuleContext.Provider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
