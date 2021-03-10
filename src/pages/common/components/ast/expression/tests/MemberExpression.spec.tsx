import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'

import {rule} from '../../../../../../fixtures/rule'
import {MemberExpressionContainer} from '../MemberExpression'

describe('<MemberExpression/>', () => {
    const minProps = ({
        object: {
            loc: {
                start: {
                    line: 1,
                    column: 7,
                },
                end: {
                    line: 1,
                    column: 26,
                },
            },
            type: 'MemberExpression',
            computed: false,
            object: {
                loc: {
                    start: {
                        line: 1,
                        column: 7,
                    },
                    end: {
                        line: 1,
                        column: 21,
                    },
                },
                type: 'MemberExpression',
                computed: false,
                object: {
                    loc: {
                        start: {
                            line: 1,
                            column: 7,
                        },
                        end: {
                            line: 1,
                            column: 14,
                        },
                    },
                    type: 'Identifier',
                    name: 'message',
                },
                property: {
                    loc: {
                        start: {
                            line: 1,
                            column: 15,
                        },
                        end: {
                            line: 1,
                            column: 21,
                        },
                    },
                    type: 'Identifier',
                    name: 'source',
                },
            },
            property: {
                loc: {
                    start: {
                        line: 1,
                        column: 22,
                    },
                    end: {
                        line: 1,
                        column: 26,
                    },
                },
                type: 'Identifier',
                name: 'from',
            },
        },
        property: {
            loc: {
                start: {
                    line: 1,
                    column: 27,
                },
                end: {
                    line: 1,
                    column: 34,
                },
            },
            type: 'Identifier',
            name: 'address',
        },
        rule: fromJS(rule),
        actions: {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn(),
        },
        parent: fromJS(['body', 0, 'test', 'arguments', 0]),
        ruleUpdated: jest.fn(),
        hasIntegrationType: () => jest.fn().mockReturnValue(true),
    } as unknown) as ComponentProps<typeof MemberExpressionContainer>

    it('should render', () => {
        const {container} = render(<MemberExpressionContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should update the dropdown on clicking a category', () => {
        const {container, getByText} = render(
            <MemberExpressionContainer {...minProps} />
        )

        fireEvent.click(getByText('Shopify Last Order'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should update the rule on clicking a variable option', () => {
        const {getByText} = render(<MemberExpressionContainer {...minProps} />)

        fireEvent.click(getByText('Shopify Last Order'))
        fireEvent.click(getByText('Fulfillment status'))
        expect(
            (minProps.ruleUpdated as jest.MockedFunction<
                typeof minProps.ruleUpdated
            >).mock.calls
        ).toMatchSnapshot()
    })
})
