import classNames from 'classnames'

import { Avatar, Box, Icon, Text } from '@gorgias/axiom'

import css from './TicketTimelineWidget.less'

type AssigneeLabelProps = {
    owner?: string
}

export function AssigneeLabel({ owner }: AssigneeLabelProps) {
    const label = owner || 'Unassigned'
    const iconColor = owner ? undefined : 'var(--content-warning-primary)'

    return (
        <Box alignItems="center" gap="xxxs">
            {owner ? (
                <Avatar name={owner} size="sm" />
            ) : (
                <Icon
                    name="user"
                    color={iconColor}
                    intent="regular"
                    size="sm"
                />
            )}

            <Text
                size="sm"
                variant="regular"
                className={classNames({
                    [css.unassignedLabel]: !owner,
                })}
            >
                {label}
            </Text>
        </Box>
    )
}
