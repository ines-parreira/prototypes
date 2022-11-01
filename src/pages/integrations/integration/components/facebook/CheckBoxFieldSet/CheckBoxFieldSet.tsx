import React, {ReactNode} from 'react'
import classNames from 'classnames'
import CheckBox, {Props as CheckBoxProps} from 'pages/common/forms/CheckBox'

type CheckBoxItem = CheckBoxProps & {
    additionalContent?: ReactNode
}

export type Props = {
    title?: ReactNode
    subtitle?: string
    checkboxes: CheckBoxItem[]
    className?: string
}

export default function CheckBoxFieldSet(props: Props) {
    const {title, subtitle, checkboxes, className} = props

    return (
        <div className={className}>
            {typeof title === 'string' ? <h4>{title}</h4> : title}
            {subtitle && <p>{subtitle}</p>}
            {checkboxes.map(
                ({children, additionalContent, ...rest}: CheckBoxItem) => (
                    <div key={rest.name} className="d-flex align-items-start">
                        <CheckBox
                            className={classNames('mb-2', rest.className)}
                            {...rest}
                        >
                            {children}
                        </CheckBox>
                        {additionalContent}
                    </div>
                )
            )}
        </div>
    )
}
