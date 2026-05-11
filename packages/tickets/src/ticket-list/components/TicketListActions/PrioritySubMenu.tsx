import { Color, Icon, MenuItem, SubMenu } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type { TicketPriority } from '@gorgias/helpdesk-queries'

const PRIORITY_OPTIONS: Array<{
    id: TicketPriority
    label: string
    icon: IconName
    color: Color
}> = [
    {
        id: 'critical',
        label: 'Critical',
        icon: 'arrow-chevron-up-duo',
        color: Color.Red,
    },
    {
        id: 'high',
        label: 'High',
        icon: 'arrow-chevron-up',
        color: Color.Orange,
    },
    {
        id: 'normal',
        label: 'Normal',
        icon: 'equals',
        color: Color.Grey,
    },
    {
        id: 'low',
        label: 'Low',
        icon: 'arrow-chevron-down',
        color: Color.Grey,
    },
]

type Props = {
    onChangePriority: (priority: TicketPriority) => void
}

export function PrioritySubMenu({ onChangePriority }: Props) {
    return (
        <SubMenu id="change-priority" label="Change priority">
            {PRIORITY_OPTIONS.map(({ id, label, icon, color }) => (
                <MenuItem
                    key={id}
                    id={id}
                    label={label}
                    leadingSlot={<Icon name={icon} size="sm" color={color} />}
                    onAction={() => onChangePriority(id)}
                />
            ))}
        </SubMenu>
    )
}
