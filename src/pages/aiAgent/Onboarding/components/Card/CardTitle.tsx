import React from 'react'

import cn from 'classnames'

import css from './styles.less'

const CardTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(css.cardTitle, className)} {...props} />
))

export default CardTitle
