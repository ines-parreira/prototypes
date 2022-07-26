import React, {ReactNode, MouseEvent} from 'react'

import closeIcon from 'assets/img/icons/close.svg'

import css from './Banner.less'

type Props = {
    children: ReactNode
    dismissible?: boolean
    preview: ReactNode
    title: ReactNode
    onClose?: (ev: MouseEvent<HTMLImageElement>) => void
}

export const Banner = ({
    children,
    dismissible = false,
    preview,
    title,
    onClose,
}: Props): JSX.Element => {
    return (
        <div className={css.container}>
            <div className={css.preview}>{preview}</div>
            <div className={css.content}>
                <h3 className={css.title}>{title}</h3>
                <div>{children}</div>
            </div>
            {dismissible && (
                <div>
                    <img
                        src={closeIcon}
                        alt="dismiss-icon"
                        className={css.close}
                        onClick={onClose}
                    />
                </div>
            )}
        </div>
    )
}
