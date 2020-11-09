import React, {ComponentProps} from 'react'
import {Map, List} from 'immutable'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import Expression from '../expression/Expression'
import DeleteBlockStatementItem from '../operations/DeleteBlockStatementItem'
import Hoverable from '../../Hoverable.js'

type Props = {
    rule: Map<any, any>
    expression: Partial<ComponentProps<typeof Expression>>
    parent: List<any>
    actions: RuleItemActions
    schemas: Map<any, any>
    depth: number
}

class ExpressionStatement extends React.Component<Props> {
    static contextTypes = {
        hovered: PropTypes.bool,
    }

    render() {
        const {expression, rule, actions, parent, schemas, depth} = this.props
        const {hovered} = this.context
        const parentNew = parent.push('expression')

        return (
            <div className={classnames('ExpressionStatement', {hovered})}>
                <DeleteBlockStatementItem
                    parent={parent}
                    rule={rule}
                    actions={actions}
                    isDisplayed={hovered}
                    type="action"
                />
                <Expression
                    {...(expression as ComponentProps<typeof Expression>)}
                    parent={parentNew}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    depth={depth}
                />
            </div>
        )
    }
}

export default Hoverable(ExpressionStatement)
