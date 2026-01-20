import type { ReactNode } from 'react'

import classnames from 'classnames'

import css from './PageHeaderRevamped.less'

type Props = {
    title: ReactNode
    className?: string
    children?: ReactNode
}

const PageHeaderRevamped = ({ title, children, className }: Props) => {
    return (
        <div
            className={classnames(className, css.pageHeaderRevamped)}
            data-testid="page-header-revamped"
        >
            {title}
            {children && <div>{children}</div>}
        </div>
    )
}

export default PageHeaderRevamped
