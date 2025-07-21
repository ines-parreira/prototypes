import classNames from 'classnames'

import css from 'domains/reporting/pages/common/components/charts/GaugeAddon.less'

type Props = {
    className?: string
    style?: React.CSSProperties
    progress: number
    color?: string
    children?: React.ReactNode
    show?: boolean
}

export default function GaugeAddon({
    className,
    style,
    progress,
    color,
    children,
    show = true,
}: Props) {
    return (
        <div className={css.wrapper}>
            {show && (
                <div
                    data-testid="GaugeAddon"
                    className={classNames(className, css.gaugeAddon)}
                    style={
                        {
                            backgroundColor: color,
                            width: `${Math.min(100, Math.max(0, progress))}%`,
                            ...style,
                        } as React.CSSProperties
                    }
                />
            )}
            {children}
        </div>
    )
}
