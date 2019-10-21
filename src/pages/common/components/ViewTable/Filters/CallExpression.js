import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {Badge} from 'reactstrap'
import {connect} from 'react-redux'
import _ from 'lodash'

import {BASIC_OPERATORS, UNARY_OPERATORS} from '../../../../../config'
import {fieldPath, findProperty} from '../../../../../utils'
import * as viewsSelectors from '../../../../../state/views/selectors'

import Left from './Left'
import Right from './Right'
import Operator from './Operator'
import OperatorLabel from './OperatorLabel'
import RemoveCallExpression from './RemoveCallExpression'


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
        teams: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,

        updateFieldFilter: PropTypes.func.isRequired,

        parentNode: PropTypes.object
    }

    _getOperators = (objectPath) => {
        const {schemas} = this.props

        const property = findProperty(objectPath, schemas)

        if (property && property.meta) {
            let operators = {
                ..._.get(property.meta, 'operators'),
                ..._.get(property.meta, 'views.additional_operators', {})
            }

            const excludedOperators = _.get(property.meta, 'views.excluded_operators', {})
            if (excludedOperators) {
                operators = _.pickBy(operators, (value, key) => !Object.keys(excludedOperators).includes(key))
            }

            return operators
        }

        return BASIC_OPERATORS
    }

    render() {
        const {
            config, view, node, updateOperator, removeCondition, index, agents, teams, currentUser, parentNode
        } = this.props

        const left = node.arguments[0]
        const right = node.arguments[1]
        const operator = node.callee

        const objectPath = resolveObjectPath(left)

        const fields = config.get('fields', fromJS([]))
        const field = fields.find((field) => objectPath === `${config.get('singular')}.${fieldPath(field)}`)

        const operators = this._getOperators(objectPath)

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
                    teams={teams}
                    currentUser={currentUser}
                    updateFieldFilter={this.props.updateFieldFilter}
                    index={index}
                    config={config}
                    field={field}
                    empty={Object.keys(UNARY_OPERATORS).includes(operator.name)}
                />
                {!field && (
                    <Badge color="danger">
                        System condition
                    </Badge>
                )}
                {
                    parentNode && (
                        <OperatorLabel operator={parentNode.operator}/>
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
