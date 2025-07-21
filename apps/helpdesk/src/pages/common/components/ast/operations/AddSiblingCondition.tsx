import { List, Map } from 'immutable'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import useHoverable from 'pages/common/hooks/useHoverable'
import { RuleItemActions } from 'pages/settings/rules/types'
import { RuleOperation } from 'state/rules/types'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    hoverableClassName: string
}

const createActionNode = (operator: string) => ({
    type: 'LogicalExpression',
    operator,
    left: null,
    right: {
        type: 'CallExpression',
        callee: {
            type: 'Identifier',
            name: 'eq',
        },
        arguments: [
            {
                type: 'MemberExpression',
                computed: false,
                object: {
                    type: 'Identifier',
                    name: 'ticket',
                },
                property: {
                    type: 'Identifier',
                    name: 'status',
                },
            },
            {
                type: 'Literal',
                value: 'open',
                raw: "'open'",
            },
        ],
    },
})

const AddSiblingCondition: React.FC<Props> = ({
    actions,
    parent,
    hoverableClassName,
}) => {
    const { setRef } = useHoverable()

    const handleClick = (operator: string) => {
        const actionNode = createActionNode(operator)
        actions.modifyCodeAST(
            parent,
            actionNode,
            RuleOperation.UpdateLogicalOperator,
        )
    }

    const condition = actions.getCondition(parent)
    const statementOperator = condition.get('operator')
    const operator = statementOperator === '&&' ? 'AND' : 'OR'

    return (
        <span className={hoverableClassName} ref={setRef}>
            <UncontrolledButtonDropdown>
                <DropdownToggle className="LogicalOperator" type="button" caret>
                    {operator}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem
                        type="button"
                        onClick={() => handleClick(statementOperator)}
                    >
                        Add <b>{operator}</b> condition
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </span>
    )
}

export default AddSiblingCondition
