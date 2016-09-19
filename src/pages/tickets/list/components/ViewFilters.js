import React, {PropTypes} from 'react'
import {findProperty} from '../../../../utils'
import {BASIC_OPERATORS, TICKET_STATUSES} from '../../../../config'
import {fromJS} from 'immutable'

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

const Left = ({view, objectPath}) => {
    // just remove the first object name. Ex: ticket.requester.id ==> requester.id
    const suffixPath = objectPath.split('.').slice(1).join('.')
    // now find our field and return it's title
    const field = view.get('fields').find(f => f.get('name') === suffixPath)
    return <span className="ui basic light blue item button">{field ? field.get('title') : suffixPath}</span>
}

Left.propTypes = {
    view: PropTypes.object.isRequired,
    objectPath: PropTypes.string.isRequired
}

const Operator = ({operators, selected, index, onChange}) => (
    <select className="ui dropdown Operator"
            defaultValue={selected}
            ref={(select) => window.jQuery && window.jQuery(select).dropdown({
                onChange: (value) => onChange(index, value)
            })}
    >
        {Object.keys(operators).map((o, idx) => (
            <option key={idx} value={o}>{operators[o].label}</option>
        ))}
    </select>
)
Operator.propTypes = {
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    operators: PropTypes.object.isRequired,
    selected: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}

const Right = ({node, objectPath, agents, tags, currentUser, updateFieldFilter, index}) => {
    let options = fromJS([])

    // use semantic-ui selects for some filters
    if (objectPath === 'ticket.assignee_user.id') {
        options = agents.map((agent) => {
            if (agent.get('id') === currentUser.get('id')) {
                // replace my name with 'Me'
                let me = agent.set('name', 'Me')

                // if we're getting the selected value from the view,
                // replace the current user id with {current_user.id},
                // that's the way the filter value is stored in the view.
                // for the select element to match the active item.
                if (node.raw === '"{current_user.id}"') {
                    me = me.set('id', '{current_user.id}')
                }

                return me
            }

            return agent
        })
    }

    if (objectPath === 'ticket.tags.name') {
        options = tags
    }

    if (objectPath === 'ticket.status') {
        options = fromJS(TICKET_STATUSES.map((status) => {
            return {
                id: status,
                name: status
            }
        }))
    }

    if (options.size) {
        return <RightSelect node={node} options={options} updateFieldFilter={updateFieldFilter} index={index}/>
    }

    return <span className="ui basic light blue button">{node.value}</span>
}
Right.propTypes = {
    node: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,

    agents: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    updateFieldFilter: PropTypes.func.isRequired,
    objectPath: PropTypes.string.isRequired
}

const RightSelect = ({node, options, updateFieldFilter, index}) => {
    function selectChange(value) {
        updateFieldFilter(index, value)
    }

    function uid(i, filterIndex) {
        return `${filterIndex}-${i}`
    }

    function createDropdown(select) {
        if (window.jQuery) {
            window.jQuery(select).dropdown({
                onChange: selectChange
            })

            // semantic-ui doesn't get the selected value the way react sets it.
            // so we need to manually update it.
            window.jQuery(select).dropdown('set selected', node.value)
        }
    }

    return (
        <div className="view-filters-expression-value">
            <select className="ui search dropdown"
                    value={node.value}
                    onChange={() => {}}
                    ref={createDropdown}
            >
                {options.map((option, i) => {
                    return (
                        <option key={uid(i, index)} value={option.get('id')}>
                            {option.get('name')}
                        </option>
                    )
                })}
            </select>
        </div>
    )
}
RightSelect.propTypes = {
    node: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateFieldFilter: PropTypes.func.isRequired
}

const RemoveCallExpression = ({index, onClick}) => (
    <i className="remove circle red large action icon" onClick={() => onClick(index)}/>
)
RemoveCallExpression.propTypes = {
    index: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired
}

export const CallExpression = ({view, schemas, node, updateOperator, removeCondition, index, agents, tags, currentUser, updateFieldFilter, parentNode}) => {
    const left = node.arguments[0]
    const right = node.arguments[1]
    const operator = node.callee

    const objectPath = resolveObjectPath(left)
    const property = findProperty(objectPath, schemas)
    const operators = property ? property.meta.operators : BASIC_OPERATORS

    return (
        <div className="CallExpression">
            <Left objectPath={objectPath} view={view}/>
            <Operator operators={operators} selected={operator.name} index={index} onChange={updateOperator}/>
            <Right node={right} objectPath={objectPath} agents={agents} tags={tags} currentUser={currentUser} updateFieldFilter={updateFieldFilter} index={index}/>
            <RemoveCallExpression onClick={removeCondition} index={index}/>

            {(() => {
                if (parentNode) {
                    return <OperatorLabel operator={parentNode.operator}/>
                }
            })()}
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

const OperatorLabel = ({operator}) => {
    const operatorLabels = {
        '&&': 'AND',
        '||': 'OR'
    }

    return <span className="ui light blue button OperatorLabel">{operatorLabels[operator]}</span>
}
OperatorLabel.propTypes = {
    operator: PropTypes.string.isRequired
}

export default class ViewFilters extends React.Component {
    removeCondition = (index) => {
        this.props.removeFieldFilter(index)
    }

    updateOperator = (index, value) => {
        this.props.updateFieldFilterOperator(index, value)
    }

    render() {
        const {view, schemas, agents, tags, currentUser, updateFieldFilter} = this.props
        if (!view || !schemas || schemas.isEmpty()) {
            return null
        }

        if (!view.get('filters_ast') || !view.getIn(['filters_ast', 'body']).size) {
            return (<div className="no-filters">No filters selected</div>)
        }

        const exp = view.get('filters_ast').toJS().body[0].expression
        // counting call expressions so we can delete them later
        let callExprCounter = 0
        const walk = (node, parentNode) => {
            switch (node.type) {
                case 'CallExpression':
                    return (
                        <div className="view-filters-item">
                            <CallExpression
                                node={node}
                                parentNode={parentNode}
                                view={view}
                                schemas={schemas}
                                index={callExprCounter++}
                                removeCondition={this.removeCondition}
                                updateOperator={this.updateOperator}
                                agents={agents}
                                tags={tags}
                                currentUser={currentUser}
                                updateFieldFilter={updateFieldFilter}
                            />
                        </div>
                    )
                case 'LogicalExpression':
                    return (<div className="view-filters-item">
                        {walk(node.left, node)}

                        {walk(node.right, node)}
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
    removeFieldFilter: PropTypes.func.isRequired,
    updateFieldFilterOperator: PropTypes.func.isRequired,
    agents: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    updateFieldFilter: PropTypes.func.isRequired
}
