import React, {
    HTMLAttributes,
    isValidElement,
    MouseEvent,
    ReactNode,
} from 'react'

import classnames from 'classnames'

import { LoadingSpinner } from '@gorgias/axiom'

import autoAwesomeIcon from 'assets/img/icons/auto_awesome.svg'
import closeIcon from 'assets/img/icons/close.svg'
import errorIcon from 'assets/img/icons/error.svg'
import infoIcon from 'assets/img/icons/info.svg'
import successIcon from 'assets/img/icons/success.svg'
import warningIcon from 'assets/img/icons/warning2.svg'

import css from './Alert.less'

export enum AlertType {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
    Loading = 'loading',
    Ai = 'ai',
}

const alertIcon = {
    [AlertType.Info]: infoIcon,
    [AlertType.Success]: successIcon,
    [AlertType.Warning]: warningIcon,
    [AlertType.Error]: errorIcon,
    [AlertType.Loading]: (
        <span className={css.loadingIcon}>
            <LoadingSpinner color="dark" size="small" />
        </span>
    ),
    [AlertType.Ai]: autoAwesomeIcon,
}

type Props = {
    children: ReactNode
    className?: string
    customActions?: ReactNode
    icon?: ReactNode
    onClose?: (e: MouseEvent) => void
    type?: AlertType
} & HTMLAttributes<HTMLDivElement>

/**
 * @deprecated This component is being phased out. Please use `<Banner variant="inline" />` from `@gorgias/axiom` instead.
 * @date 2024-03-05
 * @type ui-kit-migration
 */
const Alert = ({
    children,
    className,
    customActions,
    icon = false,
    onClose,
    type = AlertType.Info,
    ...props
}: Props) => {
    return (
        <div
            className={classnames(
                css.alert,
                css[type],
                {
                    [css.closable]: onClose,
                },
                className,
            )}
            {...props}
        >
            {icon && (
                <div className={css.iconContainer}>
                    {isValidElement(icon) ? (
                        icon
                    ) : isValidElement(alertIcon[type]) ? (
                        alertIcon[type]
                    ) : (
                        <img src={alertIcon[type] as string} alt="icon" />
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
                    aria-label="Close Icon"
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
