import React, { ReactNode } from 'react'

type Props = {
    name: string
    value?: any
    children?: ReactNode
}

export default function Item({ name, value, children }: Props) {
    if ((!value && !children) || value === null) {
        return (
            <div className="mt-1">
                <b className="mr-1">{name}:</b>
                <span>empty</span>
            </div>
        )
    }

    return (
        <div className="mt-1">
            <b className="mr-1">{name}:</b>
            {children ? children : <span>{value}</span>}
        </div>
    )
}
