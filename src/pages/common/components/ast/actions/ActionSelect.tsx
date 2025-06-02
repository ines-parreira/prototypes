import { List, Map } from 'immutable'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { RuleItemActions } from 'pages/settings/rules/types'
import { RuleOperation } from 'state/rules/types'

import { actionsConfig, isValidActionKey } from './config'

type Props = {
    actions: RuleItemActions
    parent: List<any>
    rule: Map<any, any>
    value: string
}

export default function ActionSelect({ actions, parent, rule, value }: Props) {
    const handleClick = (value: string) => {
        actions.modifyCodeAST(parent, value, RuleOperation.Update)
    }

    const label = isValidActionKey(value)
        ? actionsConfig[value]?.name
        : 'Select action'

    const setPriorityFlagEnabled = useFlag(
        FeatureFlagKey.TicketAllowPriorityUsage,
        false,
    )

    return (
        <UncontrolledButtonDropdown className="ActionSelect">
            <DropdownToggle className="mr-1" type="button" caret>
                {label}
            </DropdownToggle>
            <DropdownMenu>
                {Object.entries(actionsConfig).map(([action, config], i) => {
                    if (action === 'setPriority' && !setPriorityFlagEnabled) {
                        return null
                    }

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
