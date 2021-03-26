import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {List, Map, Seq} from 'immutable'
import {
    Expression,
    LogicalExpression,
    Program,
    ExpressionStatement,
} from 'estree'

import * as schemasSelectors from '../../../../../state/schemas/selectors'
import {
    removeFieldFilter,
    updateFieldFilter,
    updateFieldFilterOperator,
} from '../../../../../state/views/actions'
import {RootState} from '../../../../../state/types'

import CallExpression from './CallExpression'

type OwnProps = {
    view: Map<any, any>
    removeFieldFilter: typeof removeFieldFilter
    agents: List<Map<any, any>>
    teams: Seq.Indexed<Map<any, any>> | List<any>
    updateFieldFilter: typeof updateFieldFilter
    updateFieldFilterOperator: typeof updateFieldFilterOperator
}
type Props = OwnProps & ConnectedProps<typeof connector>

export class ViewFilters extends React.Component<Props> {
    removeCondition = (index: number) => {
        this.props.removeFieldFilter(index)
    }

    updateOperator = (index: number, value: string) => {
        this.props.updateFieldFilterOperator(index, value)
    }

    render() {
        const {view, schemas, agents, teams, updateFieldFilter} = this.props

        if (!view || !schemas || schemas.isEmpty()) {
            return null
        }

        if (
            !view.get('filters_ast') ||
            !(view.getIn(['filters_ast', 'body']) as List<any>).size
        ) {
            return <p className="text-muted mt-2">No filters selected</p>
        }

        const exp: LogicalExpression = (((view.get('filters_ast') as Map<
            any,
            any
        >).toJS() as Program).body[0] as ExpressionStatement)
            .expression as LogicalExpression
        // counting call expressions so we can delete them later
        let callExprCounter = 0
        const walk = (node: Expression, parentNode?: LogicalExpression) => {
            switch (node.type) {
                case 'CallExpression':
                    return (
                        <div className="view-filters-item">
                            <CallExpression
                                node={node}
                                parentNode={parentNode!}
                                view={view}
                                schemas={schemas}
                                index={callExprCounter++}
                                removeCondition={this.removeCondition}
                                updateOperator={this.updateOperator}
                                agents={agents}
                                teams={teams}
                                updateFieldFilter={updateFieldFilter}
                            />
                        </div>
                    )
                case 'LogicalExpression':
                    return (
                        <div className="view-filters-item">
                            {walk(node.left, node)}

                            {walk(node.right, node)}
                        </div>
                    )
                default:
                    throw Error(`Unknown type: ${node.type}`)
            }
        }
        return walk(exp)
    }
}

const connector = connect((state: RootState) => {
    return {
        schemas: schemasSelectors.getSchemas(state),
    }
})

export default connector(ViewFilters)
