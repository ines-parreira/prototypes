import {fromJS} from 'immutable'
import React from 'react'
import {render, screen} from '@testing-library/react'

import Expression from 'pages/common/components/ast/expression/Expression'
import {renderWithStore} from 'utils/testing'

describe('<Expression />', () => {
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
        render(<Expression {...minProps} type="unknownType" />)

        expect(screen.getByText(/Unknown/)).toBeInTheDocument()
    })

    it('should render the valid Expression component matching the passed type because it is a valid one', () => {
        renderWithStore(
            <Expression {...minProps} type="Literal" parent={fromJS([])} />,
            {}
        )

        expect(
            screen.getByText('This field cannot be empty')
        ).toBeInTheDocument()
    })
})
