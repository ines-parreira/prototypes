import React from 'react'
import {Badge} from 'reactstrap'
import classnames from 'classnames'

import {LocaleCode} from '../../../../../../../models/helpCenter/types'

import Tooltip from '../../../../../../common/components/Tooltip'

import css from './BadgeItem.less'

export type BadgeItemProps = {
    id: LocaleCode
    label: string | React.ReactNode
    isClosable?: boolean
    help?: string | React.ReactNode
    onClose?: (ev: React.MouseEvent) => void
}

export const BadgeItem = ({
    id,
    label,
    isClosable,
    help,
    onClose,
}: BadgeItemProps) => {
    return (
        <Badge data-testid={`badge-${id}`} className={css.badge}>
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
                        style={{
                            maxWidth: 180,
                            textAlign: 'left',
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
