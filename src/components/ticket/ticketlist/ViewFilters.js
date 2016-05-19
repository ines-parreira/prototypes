import React, {PropTypes} from 'react'
import {findProperty} from '../../../utils'

const resolveObjectPath = function (node) {
    switch (node.type) {
        case 'MemberExpression':
            return `${resolveObjectPath(node.object)}.${resolveObjectPath(node.property)}`
        case 'Identifier':
            return node.name
        default:
            throw Error('Unknown type', node)
    }
}

const Left = ({view, objectPath}) => {
    // just remove the first object name. Ex: ticket.requester.id ==> requester.id
    const suffixPath = objectPath.split('.').slice(1).join('.')

    // now find our field and return it's title
    const field = view.get('fields').find(f => f.get('name') === suffixPath)
    return (
        <span className="ui mini basic light blue item button">{field.get('title')}</span>
    )
}

const Operator = ({operators, selected, index, onChange}) => {
    return (
        <select className="ui simple mini dropdown Operator"
                defaultValue={selected}
                onChange={(e) => onChange(index, e)}>
            {Object.keys(operators).map((o, idx) => (
                <option key={idx} value={o}>{operators[o].label}</option>
            ))}
        </select>
    )
}

const Right = ({node}) => {
    let value = node.value
    if (node.raw.indexOf('current_user') !== -1) {
        value = 'Me'
    }
    return (<span className="ui mini basic light blue button right-expression">{value}</span>)
}

const RemoveCallExpression = ({index, onClick}) => {
    return (<i className="right floated remove circle red large action icon" onClick={() => onClick(index)}></i>)
}

const CallExpression = ({view, schemas, node, updateOperator, removeCondition, index}) => {
    const left = node.arguments[0]
    const right = node.arguments[1]
    const operator = node.callee

    const objectPath = resolveObjectPath(left)
    const operators = findProperty(objectPath, schemas).meta.operators

    return (
        <div>
            <Left objectPath={objectPath} view={view}/>
            <Operator operators={operators} selected={operator.name} index={index} onChange={updateOperator}/>
            <Right node={right}/>
            <RemoveCallExpression onClick={removeCondition} index={index}/>
        </div>
    )
}

CallExpression.propTypes = {
    node: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,

    removeCondition: PropTypes.func.isRequired,
    updateOperator: PropTypes.func.isRequired
}

const OperatorLabel = ({operator}) => {
    const operatorLabels = {
        '&&': 'AND',
        '||': 'OR'
    }
    return (
        <span className="ui light blue mini button OperatorLabel">{operatorLabels[operator]}</span>
    )
}

export default class ViewFilters extends React.Component {
    removeCondition = (index) => {
        this.props.removeFieldFilter(index)
    }
    updateOperator = (index, event) => {
        // this.props.updateFieldFilterOperator(index)
        console.log("Not implemented yet", index, event.target.value)
    }

    render() {
        const {view, schemas} = this.props
        if (schemas.isEmpty()) {
            return null
        }

        if (!view.get('filters_ast')) {
            return (<div className="no-filters">No filters selected</div>)
        }

        const exp = view.get('filters_ast').toJS().body[0].expression
        // counting call expressions so we can delete them later
        let callExprCounter = 0
        const walk = (node) => {
            switch (node.type) {
                case 'CallExpression':
                    return <CallExpression node={node}
                                           view={view}
                                           schemas={schemas}
                                           index={callExprCounter++}
                                           removeCondition={this.removeCondition}
                                           updateOperator={this.updateOperator}
                    />
                case 'LogicalExpression':
                    return (<div>
                        {walk(node.left)}
                        <OperatorLabel operator={node.operator}/>
                        {walk(node.right)}
                    </div>)
                default:
                    throw Error('Unknown type', node)
            }
        }
        return walk(exp)
    }
}

ViewFilters.propTypes = {
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    removeFieldFilter: PropTypes.func.isRequired
}
