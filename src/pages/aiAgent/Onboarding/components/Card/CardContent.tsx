import cn from 'classnames'
import React from 'react'

import css from './styles.less'

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => (
    <div ref={ref} className={cn(css.cardContent, className)} {...props} />
))

export default CardContent
