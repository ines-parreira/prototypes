import React, {ReactNode, FunctionComponent, CSSProperties} from 'react'

type Props = {
    belowInput?: boolean
    children?: ReactNode
    inline?: boolean
    tag?: keyof JSX.IntrinsicElements | FunctionComponent<any>
}

export default function Errors({
    belowInput = false,
    children,
    inline = false,
    tag: Tag = 'div',
    ...rest
}: Props) {
    if (!children) {
        return null
    }

    if (inline) {
        return (
            <Tag className="d-inline-block text-danger ml-2" {...rest}>
                {children}
            </Tag>
        )
    }

    const style: CSSProperties = {}

    // if the error is displayed below an input, make some display adjustments
    if (belowInput) {
        style.marginTop = '-8px'
        style.marginBottom = '.5rem'
    }

    return (
        <Tag className="text-danger" style={style} {...rest}>
            {children}
        </Tag>
    )
}
