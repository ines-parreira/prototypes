import { forwardRef } from 'react'

import cn from 'classnames'

import css from './styles.less'

const CardCaption = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(css.cardCaption, className)} {...props} />
))

export default CardCaption
