import React, {ReactNode, useMemo} from 'react'

type Props = {
    children: ReactNode
    className?: string
    size?: number
}

export default function DashboardGridCell({
    children,
    className,
    size = 12,
}: Props) {
    const style = useMemo(
        () => ({
            gridColumn: `span ${size} / span ${size}`,
        }),
        [size]
    )

    return (
        <div className={className} style={style}>
            {children}
        </div>
    )
}
