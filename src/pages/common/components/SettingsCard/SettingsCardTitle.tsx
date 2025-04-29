import { forwardRef } from 'react'

import cn from 'classnames'

import css from './styles.less'

const SettingsCardTitle = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { isRequired?: boolean }
>(({ className, isRequired, ...props }, ref) => (
    <div ref={ref} className={cn(css.cardTitle, className)} {...props}>
        {props.children}
        {isRequired && (
            <abbr title="required" aria-label="required">
                *
            </abbr>
        )}
    </div>
))

export default SettingsCardTitle
