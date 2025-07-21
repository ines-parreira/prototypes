import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { toJS } from 'utils'

import AddLogicalCondition from '../AddLogicalCondition'

describe('AddLogicalCondition component', () => {
    const commonProps = {
        parent: fromJS(['body', 0, 'test']),
        title: 'bar',
    } as ComponentProps<typeof AddLogicalCondition>

    it('should render empty condition', () => {
        const rule = fromJS({
            code_ast: {
                body: [
                    {
                        test: {
                            operator: null,
                        },
                    },
                ],
            },
        }) as Map<any, any>

        const { container } = render(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    modifyCodeAST: jest.fn(),
                    getCondition: (path) =>
                        (rule.getIn(['code_ast'].concat(toJS(path))) as Map<
                            any,
                            any
                        >) || fromJS({}),
                }}
                rule={rule}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an option to add AND because existing operator is already AND ', () => {
        const rule = fromJS({
            code_ast: {
                body: [
                    {
                        test: {
                            operator: '&&',
                        },
                    },
                ],
            },
        }) as Map<any, any>

        const { container } = render(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    modifyCodeAST: jest.fn(),
                    getCondition: (path) =>
                        (rule.getIn(['code_ast'].concat(toJS(path))) as Map<
                            any,
                            any
                        >) || fromJS({}),
                }}
                rule={rule}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an option to add OR because existing operator is already OR ', () => {
        const rule = fromJS({
            code_ast: {
                body: [
                    {
                        test: {
                            operator: '||',
                        },
                    },
                ],
            },
        }) as Map<any, any>

        const { container } = render(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    modifyCodeAST: jest.fn(),
                    getCondition: (path) =>
                        (rule.getIn(['code_ast'].concat(toJS(path))) as Map<
                            any,
                            any
                        >) || fromJS({}),
                }}
                rule={rule}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render an option to add ELSE because there is already an ELSE', () => {
        const rule = fromJS({
            code_ast: {
                body: [
                    {
                        test: {
                            operator: null,
                        },
                        alternate: {
                            foo: 'bar',
                        },
                    },
                ],
            },
        }) as Map<any, any>

        const { container } = render(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    modifyCodeAST: jest.fn(),
                    getCondition: (path) =>
                        (rule.getIn(['code_ast'].concat(toJS(path))) as Map<
                            any,
                            any
                        >) || fromJS({}),
                }}
                rule={rule}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
