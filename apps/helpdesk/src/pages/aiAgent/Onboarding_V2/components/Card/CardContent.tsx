import { forwardRef } from 'react'

import cn from 'classnames'

import css from './styles.less'

const CardContent = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(css.cardContent, className)} {...props} />
))

export default CardContent
