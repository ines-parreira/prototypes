import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { appQueryClient } from 'api/queryClient'
import Expression from 'pages/common/components/ast/expression/Expression'
import { renderWithStore } from 'utils/testing'

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
        renderWithStore(
            <QueryClientProvider client={appQueryClient}>
                <Expression {...minProps} {...props} />
            </QueryClientProvider>,
            {},
        )

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
