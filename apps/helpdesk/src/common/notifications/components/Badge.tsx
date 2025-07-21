import cn from 'classnames'

import useCount from '../hooks/useCount'

import css from './Badge.less'

type Props = {
    className?: string
}

export default function Badge({ className }: Props) {
    const count = useCount()
    if (count === 0) return null

    const value = count > 99 ? '99+' : count
    return <span className={cn(css.badge, className)}>{value}</span>
}
