import { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { useFlag } from 'core/flags'
import { rule } from 'fixtures/rule'
import { IDENTIFIER_VARIABLES_BY_CATEGORY } from 'models/rule/constants'

import { MemberExpressionContainer } from '../MemberExpression'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

describe('<MemberExpression/>', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    const minProps = {
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
        hasIntegrationType: () => jest.fn().mockReturnValue(true),
        hasAutomate: true,
    } as unknown as ComponentProps<typeof MemberExpressionContainer>

    it('should render', () => {
        const { container } = render(
            <MemberExpressionContainer {...minProps} />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should update the dropdown on clicking a category', () => {
        const { container, getByText } = render(
            <MemberExpressionContainer {...minProps} />,
        )
        const newValue = 'Shopify Last Order'

        fireEvent.click(getByText(newValue))
        expect(container.querySelector('.backOption')?.textContent).toContain(
            newValue,
        )
    })

    it('should update the rule on clicking a variable option', () => {
        const { getByText } = render(
            <MemberExpressionContainer {...minProps} />,
        )

        fireEvent.click(getByText('Shopify Last Order'))
        fireEvent.click(getByText('Fulfillment status'))
        const actionCall = (
            minProps.actions.modifyCodeAST as jest.MockedFunction<
                typeof minProps.actions.modifyCodeAST
            >
        ).mock.calls[0]
        expect(actionCall).toHaveLength(3)
        expect(actionCall[0]).toEqualImmutable(minProps.parent)

        const value = IDENTIFIER_VARIABLES_BY_CATEGORY['shopifyLastOrder']
            .find(({ label }) => label === 'Fulfillment status')
            ?.value!.split('.')
            .reverse()
        const outputContent = (item: Map<any, any>, count: number) => {
            if (item.get('object')) {
                expect(item.getIn(['property', 'name'])).toBe(value![count])
                outputContent(item.get('object'), count + 1)
            } else {
                expect(item.get('name')).toBe(value![count])
            }
        }

        outputContent(actionCall[1] as Map<any, any>, 0)

        expect(actionCall[2]).toBe('UPDATE')
    })
    it('should exclude quick resppnses from the drop down', () => {
        const { getByText, queryByText } = render(
            <MemberExpressionContainer {...minProps} />,
        )

        expect(queryByText('Quick Responses')).not.toBeInTheDocument()
        fireEvent.click(getByText('Self Service'))
        expect(queryByText('Quick Responses')).not.toBeInTheDocument()
    })

    it('should show the priority option', () => {
        const { getByText, queryByText } = render(
            <MemberExpressionContainer {...minProps} />,
        )

        fireEvent.click(getByText('Ticket'))
        expect(queryByText('Priority')).toBeInTheDocument()
    })
})
