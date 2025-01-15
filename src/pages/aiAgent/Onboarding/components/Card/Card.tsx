import cn from 'classnames'
import React from 'react'

import css from './styles.less'

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => (
    <div ref={ref} className={cn(css.cardContainer, className)} {...props} />
))

export default Card
