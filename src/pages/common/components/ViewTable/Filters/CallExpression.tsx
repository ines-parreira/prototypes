import React from 'react'
import {fromJS, Map, List, Seq} from 'immutable'
import {Badge} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import _get from 'lodash/get'
import _pickBy from 'lodash/pickBy'
import {
    Expression,
    CallExpression as ESCallExpression,
    LogicalExpression,
    Identifier,
    LogicalOperator,
} from 'estree'

import {BASIC_OPERATORS, UNARY_OPERATORS} from '../../../../../config'
import {fieldPath, findProperty} from '../../../../../utils'
import * as viewsSelectors from '../../../../../state/views/selectors'
import {updateFieldFilter} from '../../../../../state/views/actions'
import {RootState} from '../../../../../state/types'

import {OperatorType} from './types'
import Left from './Left'
import Right from './Right'
import Operator from './Operator'
import OperatorLabel from './OperatorLabel'
import RemoveCallExpression from './RemoveCallExpression'

const resolveObjectPath = (node: Expression): string => {
    switch (node.type) {
        case 'MemberExpression':
            return `${resolveObjectPath(
                node.object as Expression
            )}.${resolveObjectPath(node.property)}`
        case 'Identifier':
            return node.name
        default:
            throw Error(`Unknown type: ${node.type}`)
    }
}

type OwnProps = {
    node: ESCallExpression
    view: Map<any, any>
    schemas: Map<any, any>
    index: number
    removeCondition: (index: number) => void
    updateOperator: (index: number, value: string) => void
    agents: List<any>
    teams: List<Map<any, any>> | Seq.Indexed<Map<any, any>>
    updateFieldFilter: typeof updateFieldFilter
    parentNode: LogicalExpression
}

type Props = OwnProps & ConnectedProps<typeof connector>

class CallExpression extends React.Component<Props> {
    _getOperators = (objectPath: string): Record<string, OperatorType> => {
        const {schemas} = this.props

        const property = findProperty(objectPath, schemas)

        if (property && property.meta) {
            let operators = {
                ...(_get(property.meta, 'operators') as Record<
                    string,
                    unknown
                >),
                ...(_get(
                    property.meta,
                    'views.additional_operators',
                    {}
                ) as Record<string, OperatorType>),
            }

            const excludedOperators = _get(
                property.meta,
                'views.excluded_operators',
                {}
            ) as Record<string, OperatorType>

            if (excludedOperators) {
                operators = _pickBy(
                    operators,
                    (value, key) =>
                        !Object.keys(excludedOperators).includes(key)
                )
            }

            return operators as Record<string, OperatorType>
        }

        return BASIC_OPERATORS
    }

    render() {
        const {
            config,
            view,
            node,
            updateOperator,
            removeCondition,
            index,
            agents,
            teams,
            parentNode,
        } = this.props

        const [left, right] = node.arguments as Expression[]

        const operator = node.callee as Identifier

        const objectPath = resolveObjectPath(left)

        const fields = config.get('fields', fromJS([])) as List<any>
        const field = fields.find(
            (field: Map<any, any>) =>
                objectPath ===
                `${config.get('singular') as string}.${fieldPath(field)}`
        )

        const operators = this._getOperators(objectPath)

        return (
            <div className="CallExpression">
                <Left objectPath={objectPath} view={view} />
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
                    updateFieldFilter={this.props.updateFieldFilter}
                    index={index}
                    config={config}
                    field={field}
                    empty={Object.keys(UNARY_OPERATORS).includes(operator.name)}
                />
                {!field && <Badge color="danger">System condition</Badge>}
                {parentNode && (
                    <OperatorLabel
                        operator={
                            parentNode.operator as Exclude<
                                LogicalOperator,
                                '??'
                            >
                        }
                    />
                )}
                <RemoveCallExpression onClick={removeCondition} index={index} />
            </div>
        )
    }
}

const connector = connect((state: RootState) => {
    return {
        config: viewsSelectors.getActiveViewConfig(state),
    }
})

export default connector(CallExpression)
