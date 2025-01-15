import cn from 'classnames'
import React from 'react'

import css from './styles.less'

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => (
    <div ref={ref} className={cn(css.cardHeader, className)} {...props} />
))

export default CardHeader
