import classNames from 'classnames'
import React, {ReactNode} from 'react'

import css from './ContactCard.less'

type Props = {
    icon: string
    title: string
    disabled: boolean
    children: ReactNode
    helpText?: string
    clickable?: boolean
    className?: string
}

const ContactCard: React.FC<Props> = ({
    icon,
    title,
    disabled,
    children,
    helpText,
    clickable = true,
    className,
}: Props) => (
    <div className={classNames(css.container, className)}>
        <div className={classNames(css.card, {[css.disabled]: disabled})}>
            <div
                className={classNames(css.header, {
                    [css.clickable]: clickable && !disabled,
                })}
            >
                <i className={classNames('material-icons', css.icon)}>{icon}</i>
                <span className={css.title}>{title}</span>
                {clickable && (
                    <i className={classNames('material-icons', css.chevron)}>
                        chevron_right
                    </i>
                )}
            </div>
            {!disabled && <pre className={css.content}>{children}</pre>}
        </div>
        {helpText && <span className={css.help}>{helpText}</span>}
    </div>
)

export default ContactCard
