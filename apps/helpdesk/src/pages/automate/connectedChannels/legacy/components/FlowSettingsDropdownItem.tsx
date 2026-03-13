import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './FlowsSettingsDropdownItem.less'

interface Props {
    label: string
    value: string
    triggerName?: string
    onEnable?: () => void
}

export const FlowSettingsDropdownItem = ({
    label,
    value,
    triggerName,
    onEnable,
}: Props) => {
    return (
        <DropdownItem
            option={{
                label,
                value,
            }}
            onClick={() => {
                onEnable?.()
            }}
            className={css.workflowDropdownItem}
        >
            <div>{label}</div>
            <span className={css.workflowTriggerName}>{triggerName}</span>
        </DropdownItem>
    )
}
