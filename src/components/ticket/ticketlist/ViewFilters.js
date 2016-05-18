import React, {PropTypes} from 'react'

const Left = ({view, node}) => {
    const resolve = function (n) {
        switch (n.type) {
            case 'MemberExpression':
                return `${resolve(n.object)}.${resolve(n.property)}`
            case 'Identifier':
                return n.name
            default:
                throw Error('Unknown type', node)
        }
    }
    // just remove the first object name. Ex: ticket.requester.id ==> requester.id
    const objectPath = resolve(node).split('.').slice(1).join('.')


    // now find our field and return it's title
    const field = view.get('fields').find(f => f.get('name') === objectPath)
    return (
        <span>{field.get('title')}</span>
    )
}

const Operator = ({schemas, node}) => {
    return (
        <select>
            <option value="{node.name}">{node.name}</option>
        </select>
    )
}

const Right = ({node}) => {
    let value = node.value
    if (node.raw.indexOf('current_user') !== -1) {
        value = 'Me'
    }
    return (<span>{value}</span>)
}

const RemoveCallExpression = ({node, index}) => {
    return (<span></span>)
}

const CallExpression = ({view, schemas, node, index}) => {
    const left = node.arguments[0]
    const right = node.arguments[1]
    const operator = node.callee

    return (
        <div>
            <Left node={left} view={view}/>
            <Operator node={operator} schemas={schemas}/>
            <Right node={right}/>
            <RemoveCallExpression node={node} index={index}/>
        </div>
    )
}

CallExpression.propTypes = {
    node: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
}

const OperatorLabel = ({operator}) => {
    const operatorLabels = {
        '&&': 'AND',
        '||': 'OR'
    }
    return (
        <div className="ui label">{operatorLabels[operator]}</div>
    )
}

const LogicalExpression = ({node, view, schemas}) => {
    const left = node.left
    const right = node.right
    const operator = node.operator

    return (
        <div>
            <CallExpression node={left} view={view} schemas={schemas} index={0}/>
            <OperatorLabel operator={operator}/>
            <CallExpression node={right} view={view} schemas={schemas} index={1}/>
        </div>
    )
}

LogicalExpression.propTypes = {
    node: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired
}

export default class ViewFilters extends React.Component {
    render() {
        const {view, schemas} = this.props
        if (schemas.isEmpty()) {
            return null
        }
        const node = view.get('filters_ast').toJS().body[0].expression
        switch (node.type) {
            case 'CallExpression':
                return <CallExpression node={node} view={view} schemas={schemas} index={0}/>
            case 'LogicalExpression':
                return <LogicalExpression node={node} view={view} schemas={schemas}/>
            default:
                throw Error('Unknown type', node)
        }
    }
}

ViewFilters.propTypes = {
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired
}
