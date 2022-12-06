import React from 'react'
import {List, Map} from 'immutable'
import {
    Expression,
    LogicalExpression,
    Program,
    ExpressionStatement,
} from 'estree'

import {getAgents} from 'state/agents/selectors'
import {getSchemas} from 'state/schemas/selectors'
import {getTeams} from 'state/teams/selectors'
import {getActiveView} from 'state/views/selectors'
import {
    removeFieldFilter,
    updateFieldFilter,
    updateFieldFilterOperator,
} from 'state/views/actions'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import CallExpression from './CallExpression'

export default function ViewFilters() {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getAgents)
    const schemas = useAppSelector(getSchemas)
    const teams = useAppSelector(getTeams)
    const view = useAppSelector(getActiveView)

    if (!view || !schemas || schemas.isEmpty()) {
        return null
    }

    if (
        !view.get('filters_ast') ||
        !(view.getIn(['filters_ast', 'body']) as List<any>).size
    ) {
        return <p className="text-muted mt-2">No filters selected</p>
    }

    const exp: LogicalExpression = (
        ((view.get('filters_ast') as Map<any, any>).toJS() as Program)
            .body[0] as ExpressionStatement
    ).expression as LogicalExpression

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
                            removeCondition={(index) =>
                                dispatch(removeFieldFilter(index))
                            }
                            updateOperator={(index, value) =>
                                dispatch(
                                    updateFieldFilterOperator(index, value)
                                )
                            }
                            agents={agents}
                            teams={teams}
                            updateFieldFilter={(index, value) =>
                                dispatch(updateFieldFilter(index, value))
                            }
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
