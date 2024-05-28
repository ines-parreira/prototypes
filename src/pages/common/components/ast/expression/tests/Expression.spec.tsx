import {fromJS} from 'immutable'
import React from 'react'
import {render} from '@testing-library/react'

import Expression from 'pages/common/components/ast/expression/Expression'
import {renderWithStore} from 'utils/testing'

describe('Expression component', () => {
    const minProps = {
        type: 'someType',
        actions: {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn(),
        },
        parent: fromJS({}),
        rule: fromJS({}),
        schemas: fromJS({}),
        leftsiblings: null,
        depth: 0,
    }
    it('should render UnknownSyntax because the passed type is invalid, and pass all props to child', () => {
        const {container} = render(
            <Expression {...minProps} type="unknownType" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the valid Expression component matching the passed type because it is a valid one', () => {
        const {container} = renderWithStore(
            <Expression {...minProps} type="Literal" parent={fromJS([])} />,
            {}
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
