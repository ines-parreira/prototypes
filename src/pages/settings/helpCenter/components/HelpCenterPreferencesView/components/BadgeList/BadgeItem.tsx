import {Tooltip} from '@gorgias/ui-kit'
import classnames from 'classnames'
import React from 'react'
import {Badge} from 'reactstrap'

import {LocaleCode} from '../../../../../../../models/helpCenter/types'

import css from './BadgeItem.less'

export type BadgeItemProps = {
    id: LocaleCode
    label: string | React.ReactNode
    isClosable?: boolean
    help?: string | React.ReactNode
    customClass?: string
    onClose?: (ev: React.MouseEvent) => void
}

export const BadgeItem: React.FC<BadgeItemProps> = ({
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
                            'material-icons-outlined'
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
                        'material-icons cursor-pointer ml-1'
                    )}
                    onClick={onClose}
                >
                    close
                </i>
            )}
        </Badge>
    )
}
