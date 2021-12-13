import React, {ReactNode, MouseEvent, isValidElement} from 'react'
import classnames from 'classnames'

import infoIcon from 'assets/img/icons/info.svg'
import successIcon from 'assets/img/icons/success.svg'
import warningIcon from 'assets/img/icons/warning2.svg'
import errorIcon from 'assets/img/icons/error.svg'
import closeIcon from 'assets/img/icons/close.svg'

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

export type Props = {
    children: ReactNode
    className?: string
    customActions?: ReactNode
    icon?: boolean | ReactNode
    onClose?: (e: MouseEvent) => void
    type?: AlertType
}

const Alert = ({
    children,
    className,
    customActions,
    icon = false,
    onClose,
    type = AlertType.Info,
}: Props) => {
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
            {icon && (
                <div className={css.iconContainer}>
                    {isValidElement(icon) ? (
                        icon
                    ) : (
                        <img
                            src={alertIcon[type]}
                            alt="icon"
                            className={css.icon}
                        />
                    )}
                </div>
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
                    aria-label={'Close Icon'}
                >
                    <img
                        src={closeIcon}
                        alt="close-icon"
                        className={css.closeIcon}
                    />
                </div>
            )}
        </div>
    )
}

export default Alert
