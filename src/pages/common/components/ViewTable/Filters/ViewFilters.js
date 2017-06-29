import React, {PropTypes} from 'react'
import {connect} from 'react-redux'

import CallExpression from './CallExpression'

import * as schemasSelectors from '../../../../../state/schemas/selectors'

export class ViewFilters extends React.Component {
    removeCondition = (index) => {
        this.props.removeFieldFilter(index)
    }

    updateOperator = (index, value) => {
        this.props.updateFieldFilterOperator(index, value)
    }

    render() {
        const {view, schemas, agents, currentUser, updateFieldFilter, updateFieldFilterOperator} = this.props

        if (!view || !schemas || schemas.isEmpty()) {
            return null
        }

        if (!view.get('filters_ast') || !view.getIn(['filters_ast', 'body']).size) {
            return (
                <p className="text-muted mt-2">
                    No filters selected
                </p>
            )
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
                                currentUser={currentUser}
                                updateFieldFilter={updateFieldFilter}
                                updateFieldFilterOperator={updateFieldFilterOperator}
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
    agents: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    updateFieldFilter: PropTypes.func.isRequired,
    updateFieldFilterOperator: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
    return {
        schemas: schemasSelectors.getSchemas(state),
    }
}

export default connect(mapStateToProps)(ViewFilters)
