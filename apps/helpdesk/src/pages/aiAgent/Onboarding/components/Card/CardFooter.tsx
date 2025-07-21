import { forwardRef } from 'react'

import cn from 'classnames'

import css from './styles.less'

const CardFooter = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(css.cardFooter, className)} {...props} />
))

export default CardFooter
