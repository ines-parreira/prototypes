import type { ReactNode } from 'react'

type Props = {
    title: ReactNode
    className?: string
    children?: ReactNode
}

const PageHeaderRevamped = ({ title, children, className }: Props) => {
    return (
        <div className={className} data-testid="page-header-revamped">
            {title}
            {children && <div>{children}</div>}
        </div>
    )
}

export default PageHeaderRevamped
