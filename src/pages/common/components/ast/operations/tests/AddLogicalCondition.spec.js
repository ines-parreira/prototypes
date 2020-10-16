import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {AddLogicalCondition} from '../AddLogicalCondition.tsx'
import {toJS} from '../../../../../../utils.ts'

describe('AddLogicalCondition component', () => {
    const commonProps = {
        parent: fromJS(['body', 0, 'test']),
        title: 'bar',
    }

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
        })

        const component = shallow(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    getCondition: (path) =>
                        rule.getIn(['code_ast'].concat(toJS(path))) ||
                        fromJS({}),
                }}
                rule={rule}
            />
        )

        expect(component).toMatchSnapshot()
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
        })

        const component = shallow(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    getCondition: (path) =>
                        rule.getIn(['code_ast'].concat(toJS(path))) ||
                        fromJS({}),
                }}
                rule={rule}
            />
        )

        expect(component).toMatchSnapshot()
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
        })

        const component = shallow(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    getCondition: (path) =>
                        rule.getIn(['code_ast'].concat(toJS(path))) ||
                        fromJS({}),
                }}
                rule={rule}
            />
        )

        expect(component).toMatchSnapshot()
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
        })

        const component = shallow(
            <AddLogicalCondition
                {...commonProps}
                actions={{
                    getCondition: (path) =>
                        rule.getIn(['code_ast'].concat(toJS(path))) ||
                        fromJS({}),
                }}
                rule={rule}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
