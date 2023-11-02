import React from 'react'

type Props = {
    params?: Record<string, string>
}

export default function Params({params}: Props) {
    if (!params) {
        return null
    }

    return (
        <ul>
            {Object.entries(params).map(([key, value]) => (
                <li key={key}>
                    <b className="mr-1">{key}:</b>
                    <span>{value}</span>
                </li>
            ))}
        </ul>
    )
}
