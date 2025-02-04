import cn from 'classnames'
import React from 'react'

import css from './styles.less'

const CardCaption = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => (
    <div ref={ref} className={cn(css.cardCaption, className)} {...props} />
))

export default CardCaption
