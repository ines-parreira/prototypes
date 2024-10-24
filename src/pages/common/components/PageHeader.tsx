import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './PageHeader.less'

type Props = {
    title: unknown
    className?: string
    children?: ReactNode
}

const PageHeader = ({title, children, className}: Props) => (
    <div className={classnames('page-header', css.pageHeader, className)}>
        {typeof title === 'string' ? (
            <h1 className="d-flex align-items-center">{title}</h1>
        ) : (
            title
        )}
        {children && <div>{children}</div>}
    </div>
)

export default PageHeader
