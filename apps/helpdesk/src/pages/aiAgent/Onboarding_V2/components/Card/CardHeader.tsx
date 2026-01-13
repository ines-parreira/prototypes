import { forwardRef } from 'react'

import cn from 'classnames'

import css from './styles.less'

const CardHeader = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(css.cardHeader, className)} {...props} />
))

export default CardHeader
