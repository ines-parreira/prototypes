import React, {ComponentProps} from 'react'
import {Button} from 'reactstrap'
import {Map, List} from 'immutable'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import {getSyntaxTreeLeaves} from '../utils.js'

import Expression from './Expression'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    left: Partial<ComponentProps<typeof Expression>> & {type: string}
    leftsiblings?: List<any>
    operator: string
    parent: List<any>
    right: Partial<ComponentProps<typeof Expression>> & {type: string}
    schemas: Map<any, any>
}

export default class LogicalExpression extends React.Component<Props> {
    render() {
        const {
            operator,
            left,
            right,
            rule,
            parent,
            actions,
            leftsiblings,
            schemas,
        } = this.props

        let leftsiblings2
        let leftsiblings3

        if (leftsiblings) {
            leftsiblings2 = leftsiblings.concat(
                getSyntaxTreeLeaves(left)
            ) as List<any>
            leftsiblings3 = leftsiblings2.push('operator')
        }

        return (
            <>
                <Expression
                    {...(left as ComponentProps<typeof Expression>)}
                    parent={parent.push('left')}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings}
                    className="IdentifierDropdown"
                />
                <div className="d-flex align-items-baseline mt-1 ml-3">
                    <Button
                        className="LogicalOperator btn-frozen mr-1"
                        type="button"
                        color="warning"
                    >
                        {operator === '&&' ? 'AND' : 'OR'}
                    </Button>
                    <Expression
                        {...(right as ComponentProps<typeof Expression>)}
                        parent={parent.push('right')}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={leftsiblings3}
                        className="IdentifierDropdown"
                    />
                </div>
            </>
        )
    }
}
