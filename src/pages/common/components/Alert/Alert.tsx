import React, {ReactNode, MouseEvent} from 'react'
import classnames from 'classnames'

import infoIcon from '../../../../../img/icons/info.svg'
import successIcon from '../../../../../img/icons/success.svg'
import warningIcon from '../../../../../img/icons/warning2.svg'
import errorIcon from '../../../../../img/icons/error.svg'

import css from './Alert.less'

export enum AlertType {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
}

const alertIcon = {
    [AlertType.Info]: infoIcon,
    [AlertType.Success]: successIcon,
    [AlertType.Warning]: warningIcon,
    [AlertType.Error]: errorIcon,
}

export type AlertProps = {
    children: ReactNode
    className?: string
    customActions?: ReactNode
    showIcon?: boolean
    onClose?: (e: MouseEvent) => void
    type?: AlertType
}

const Alert = ({
    children,
    className,
    customActions,
    showIcon = false,
    onClose,
    type = AlertType.Info,
}: AlertProps) => {
    return (
        <div
            className={classnames(
                css.alert,
                css[type],
                {
                    [css.closable]: onClose,
                },
                className
            )}
        >
            {showIcon && (
                <img src={alertIcon[type]} alt="icon" className={css.icon} />
            )}
            <div className={css.content}>
                <span className={css.label}>{children}</span>
                {customActions && (
                    <div className={css.customActions}>{customActions}</div>
                )}
            </div>
            {onClose && (
                <div
                    className={css.close}
                    onClick={onClose}
                    data-testid="close-trigger"
                />
            )}
        </div>
    )
}

export default Alert
