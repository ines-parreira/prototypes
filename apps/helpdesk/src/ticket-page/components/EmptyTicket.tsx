import classNames from 'classnames'

import css from './EmptyTicket.less'

export default function EmptyTicket({ className }: { className?: string }) {
    return (
        <div className={classNames(css.empty, className)}>
            <div className={css.logo} />
        </div>
    )
}
