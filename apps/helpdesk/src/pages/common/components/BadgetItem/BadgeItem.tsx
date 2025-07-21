import classnames from 'classnames'
import { Badge } from 'reactstrap'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import css from './BadgeItem.less'

export type BadgeItemProps = {
    id: string
    label: string | React.ReactNode
    isClosable?: boolean
    help?: string | React.ReactNode
    customClass?: string
    onClose?: (ev: React.MouseEvent) => void
}

const BadgeItem: React.FC<BadgeItemProps> = ({
    id,
    label,
    isClosable,
    help,
    customClass,
    onClose,
}: BadgeItemProps) => {
    return (
        <Badge
            data-testid={`badge-${id}`}
            id={`badge-${id}`}
            className={classnames(css.badge, customClass ?? '')}
            color="none"
        >
            <span>{label}</span>
            {help && (
                <span className={css['badge-suffix']}>
                    <span
                        id={`help-${id}`}
                        data-testid={`help-${id}`}
                        className={classnames(
                            css['badge-icon'],
                            'material-icons-outlined',
                        )}
                    >
                        info
                    </span>
                    <Tooltip
                        placement="top-start"
                        target={`help-${id}`}
                        innerProps={{
                            style: {
                                maxWidth: 180,
                                textAlign: 'left',
                            },
                        }}
                    >
                        {help}
                    </Tooltip>
                </span>
            )}
            {isClosable && (
                <i
                    className={classnames(
                        css['badge-icon'],
                        'material-icons cursor-pointer ml-1',
                    )}
                    onClick={onClose}
                >
                    close
                </i>
            )}
        </Badge>
    )
}

export default BadgeItem
