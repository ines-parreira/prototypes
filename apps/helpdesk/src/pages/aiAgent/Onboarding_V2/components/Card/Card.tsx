import { forwardRef } from 'react'

import cn from 'classnames'

import css from './styles.less'

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(css.cardContainer, className)}
            {...props}
        />
    ),
)

export default Card
