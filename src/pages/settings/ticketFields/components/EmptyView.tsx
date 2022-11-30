import React from 'react'
import Button from 'pages/common/components/button/Button'
import css from './EmptyView.less'

interface Props {
    title: string
    button: string
    onClick: () => void
    children: any
}

export default function EmptyView(props: Props) {
    return (
        <div className={css.container}>
            <h2>{props.title}</h2>
            {props.children}
            <Button onClick={props.onClick}>{props.button}</Button>
        </div>
    )
}
