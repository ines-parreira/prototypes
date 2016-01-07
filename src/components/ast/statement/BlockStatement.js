import React, {PropTypes} from 'react'
import Statement from './Statement'
import {AddLine, DeleteBlockStatementItem} from '../OperationButtons'

/*
 interface BlockStatement <: Statement {
 type: "BlockStatement";
 body: [ Statement ];
 }
 */
export default class BlockStatement extends React.Component {
    render() {
        const { body, index, actions, parent } = this.props

        const statements = body.map((bodyItem, idx) => {
            const parentNew = parent.push('body', idx)

            return (
                <div className="BlockStatementItem" key={ idx }>
                    <div className="item">
                        <DeleteBlockStatementItem
                            parent={parentNew}
                            index={index}
                            actions={actions}/>
                        <Statement
                            {...bodyItem}
                            parent={parentNew}
                            index={index}
                            actions={ actions }/>
                    </div>
                    <AddLine
                        parent={parentNew}
                        index={index}
                        actions={actions}
                    />
                </div>
            )
        })

        const parentNew = parent.push('body', -1)
        statements.unshift(
            (
                <div className="BlockStatementItem" key={ -1 }>
                    <AddLine
                        parent={parentNew}
                        index={index}
                        actions={actions}
                    />
                </div>
            )
        )

        return (
            <div className="BlockStatement">
                { statements }
            </div>
        )
    }
}

BlockStatement.propTypes = {
    body: PropTypes.array,
    index: PropTypes.number,
    parent: PropTypes.object,
    actions: PropTypes.object
}
