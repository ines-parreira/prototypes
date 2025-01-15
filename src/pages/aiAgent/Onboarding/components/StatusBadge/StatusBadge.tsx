import React, {useMemo} from 'react'

import Badge from 'gorgias-design-system/Badge/Badge'

import css from './StatusBadge.less'

enum StatusEnum {
    Connected = 'Connected',
    Disconnected = 'Disconnected',
}

type Props = {
    status: StatusEnum
}

const StatusBadge: React.FC<Props> = ({status}) => {
    const badgeColor = useMemo(() => {
        switch (status) {
            case StatusEnum.Connected:
                return 'accessoryGreen'
            case StatusEnum.Disconnected:
                return 'accessoryGrey'
        }
    }, [status])

    return <Badge color={badgeColor} label={status} className={css.badge} />
}

export default StatusBadge
export {Props as StatusBadgeProps, StatusEnum}
