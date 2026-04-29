import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import Expression from 'pages/common/components/ast/expression/Expression'

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

    const renderComponent = (
        props?: Partial<ComponentProps<typeof Expression>>,
    ) =>
        render(<Expression {...minProps} {...props} />, {
            storeState: { integrations: fromJS({ integrations: [] }) },
        })

    it('should render UnknownSyntax because the passed type is invalid, and pass all props to child', () => {
        renderComponent({ type: 'unknownType' })

        expect(screen.getByText(/Unknown/)).toBeInTheDocument()
    })

    it('should render the valid Expression component matching the passed type because it is a valid one', () => {
        renderComponent({ type: 'Literal', parent: fromJS([]) })

        expect(
            screen.getByText('This field cannot be empty'),
        ).toBeInTheDocument()
    })
})
