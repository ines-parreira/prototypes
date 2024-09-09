import React from 'react'
import {Map, List} from 'immutable'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import {RuleItemActions} from 'pages/settings/rules/types'
import {RuleOperation} from 'state/rules/types'

import {actionsConfig} from './config'

type Props = {
    actions: RuleItemActions
    parent: List<any>
    rule: Map<any, any>
    value: string
}

export default function ActionSelect({actions, parent, rule, value}: Props) {
    const handleClick = (value: string) => {
        actions.modifyCodeAST(parent, value, RuleOperation.Update)
    }

    const label = actionsConfig[value]?.name || value || 'Select action'

    return (
        <UncontrolledButtonDropdown className="ActionSelect">
            <DropdownToggle className="mr-1" type="button" caret>
                {label}
            </DropdownToggle>
            <DropdownMenu>
                {Object.entries(actionsConfig).map(([action, config], i) => {
                    return config?.type === 'system' &&
                        !(rule.get('type') === 'system') ? null : (
                        <DropdownItem
                            key={i}
                            type="button"
                            onClick={() => handleClick(action)}
                        >
                            {config.name || action}
                        </DropdownItem>
                    )
                })}
            </DropdownMenu>
        </UncontrolledButtonDropdown>
    )
}
