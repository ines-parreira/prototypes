import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {Badge} from 'reactstrap'
import {connect} from 'react-redux'

import {BASIC_OPERATORS, EMPTY_OPERATORS} from '../../../../../config'
import Left from './Left'
import Right from './Right'
import Operator from './Operator'
import OperatorLabel from './OperatorLabel'
import RemoveCallExpression from './RemoveCallExpression'
import {findProperty} from '../../../../../utils'

import {fieldPath} from '../../../../../utils'
import * as viewsSelectors from '../../../../../state/views/selectors'

const resolveObjectPath = (node) => {
    switch (node.type) {
        case 'MemberExpression':
            return `${resolveObjectPath(node.object)}.${resolveObjectPath(node.property)}`
        case 'Identifier':
            return node.name
        default:
            throw Error('Unknown type', node)
    }
}
@connect((state) => {
    return {
        config: viewsSelectors.getActiveViewConfig(state)
    }
})
export default class CallExpression extends React.Component {
    static propTypes = {
        config: ImmutablePropTypes.map.isRequired,
        node: PropTypes.object.isRequired,
        view: PropTypes.object.isRequired,
        schemas: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,

        removeCondition: PropTypes.func.isRequired,
        updateOperator: PropTypes.func.isRequired,

        agents: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,

        updateFieldFilter: PropTypes.func.isRequired,
        updateFieldFilterOperator: PropTypes.func.isRequired,

        parentNode: PropTypes.object
    }

    render() {
        const {config, view, schemas, node, updateOperator, removeCondition, index, agents, currentUser, parentNode} = this.props

        const left = node.arguments[0]
        const right = node.arguments[1]
        const operator = node.callee

        const objectPath = resolveObjectPath(left)
        const property = findProperty(objectPath, schemas)
        let operators = property && property.meta ? property.meta.operators : BASIC_OPERATORS

        const fields = config.get('fields', fromJS([]))
        const field = fields.find((field) => objectPath === `${config.get('singular')}.${fieldPath(field)}`)

        return (
            <div className="CallExpression">
                <Left
                    objectPath={objectPath}
                    view={view}
                />
                <Operator
                    operators={operators}
                    selected={operator.name}
                    index={index}
                    onChange={updateOperator}
                />
                <Right
                    operator={operator}
                    node={right}
                    objectPath={objectPath}
                    agents={agents}
                    currentUser={currentUser}
                    updateFieldFilter={this.props.updateFieldFilter}
                    updateFieldFilterOperator={this.props.updateFieldFilterOperator}
                    index={index}
                    config={config}
                    field={field}
                    empty={Object.keys(EMPTY_OPERATORS).includes(operator.name)}
                />
                {!field && (
                    <Badge color="danger">
                        System condition
                    </Badge>
                )}
                {
                    parentNode && (
                        <OperatorLabel operator={parentNode.operator} />
                    )
                }
                <RemoveCallExpression
                    onClick={removeCondition}
                    index={index}
                />
            </div>
        )
    }
}
