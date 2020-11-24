import React, {ReactNode} from 'react'
import classnames from 'classnames'

type Props = {
    title: string | unknown
    className?: string
    children?: ReactNode
}

const PageHeader = ({title, children, className}: Props) => (
    <div
        className={classnames(
            'd-flex',
            'align-items-center',
            'justify-content-between',
            'flex-wrap',
            'page-header',
            className
        )}
    >
        {typeof title === 'string' ? (
            <h1 className="d-flex align-items-center">{title}</h1>
        ) : (
            title
        )}
        {children && <div>{children}</div>}
    </div>
)

export default PageHeader
