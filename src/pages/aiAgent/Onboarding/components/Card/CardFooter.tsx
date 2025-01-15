import cn from 'classnames'
import React from 'react'

import css from './styles.less'

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => (
    <div ref={ref} className={cn(css.cardFooter, className)} {...props} />
))

export default CardFooter
