import React from 'react'

import AddActionOrIfStatement from 'pages/common/components/ast/operations/AddActionOrIfStatement'
import Foldable from 'pages/common/components/ast/Foldable/Foldable'

import {ConsequentStatementProps} from '../types'
import {StatementProps, statementReference} from './statementReference'

export const ConsequentStatement = ({
    actions,
    consequent,
    rule,
    parent,
    schemas,
    depth,
}: ConsequentStatementProps) => {
    const {Statement} = statementReference

    return (
        <div className="consequent">
            <Foldable
                label={
                    <AddActionOrIfStatement
                        actions={actions}
                        rule={rule}
                        parent={parent.push('consequent')}
                        title="THEN"
                        hoverableClassName="d-inline-flex"
                        depth={depth}
                        empty={consequent.body?.length === 0}
                    />
                }
            >
                <Statement
                    {...(consequent as StatementProps)}
                    parent={parent.push('consequent')}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    depth={depth + 1}
                />
            </Foldable>
        </div>
    )
}
