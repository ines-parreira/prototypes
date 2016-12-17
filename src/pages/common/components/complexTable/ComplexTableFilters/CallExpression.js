import React, {PropTypes} from 'react'
import {BASIC_OPERATORS, EMPTY_OPERATORS} from '../../../../../config'
import Left from './Left'
import Right from './Right'
import Operator from './Operator'
import OperatorLabel from './OperatorLabel'
import RemoveCallExpression from './RemoveCallExpression'
import {findProperty} from '../../../../../utils'
import _includes from 'lodash/includes'

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

const CallExpression = ({view, schemas, node, updateOperator, removeCondition, index, agents, tags, currentUser, updateFieldFilter, parentNode}) => {
    const left = node.arguments[0]
    const right = node.arguments[1]
    const operator = node.callee

    const objectPath = resolveObjectPath(left)
    const property = findProperty(objectPath, schemas)
    const operators = property && property.meta ? property.meta.operators : BASIC_OPERATORS

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
                node={right}
                objectPath={objectPath}
                agents={agents}
                tags={tags}
                currentUser={currentUser}
                onChange={updateFieldFilter}
                index={index}
                empty={_includes(Object.keys(EMPTY_OPERATORS), operator.name)}
            />
            <RemoveCallExpression
                onClick={removeCondition}
                index={index}
            />
            {parentNode && <OperatorLabel operator={parentNode.operator}/>}
        </div>
    )
}

CallExpression.propTypes = {
    node: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,

    removeCondition: PropTypes.func.isRequired,
    updateOperator: PropTypes.func.isRequired,

    agents: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    updateFieldFilter: PropTypes.func.isRequired,

    parentNode: PropTypes.object
}

export default CallExpression
