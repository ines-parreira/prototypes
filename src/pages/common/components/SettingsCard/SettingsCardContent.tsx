import { forwardRef } from 'react'

import cn from 'classnames'

import css from './styles.less'

const SettingsCardContent = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(css.cardContent, className)} {...props} />
))

export default SettingsCardContent
