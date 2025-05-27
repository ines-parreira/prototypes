import classNames from 'classnames'

import css from './EmptyTicket.less'

export default function EmptyTicket({
    title,
    className,
}: {
    title?: string
    className?: string
}) {
    return (
        <div className={classNames(css.empty, className)}>
            <div className={css.logo} />
            {title && <div className={css.title}>{title}</div>}
        </div>
    )
}
