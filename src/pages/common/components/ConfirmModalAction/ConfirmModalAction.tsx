import React from 'react'

import DEPRECATED_Modal from '../DEPRECATED_Modal'

import css from './ConfirmModalAction.less'

type Props = {
    actions: (onClose: () => void) => React.ReactNode
    children: (onClick: (ev: React.MouseEvent) => void) => React.ReactNode
    content: string | React.ReactNode
    title: string | React.ReactNode
}

export const ConfirmModalAction = ({
    actions,
    children,
    content,
    title,
}: Props) => {
    const [isOpen, setOpen] = React.useState(false)

    const handleOnClose = () => {
        setOpen(false)
    }

    const handleOnOpen = () => {
        setOpen(true)
    }

    return (
        <>
            {children(handleOnOpen)}
            <DEPRECATED_Modal
                isOpen={isOpen}
                className={css['modal-centered']}
                header={title}
                footer={actions(handleOnClose)}
                style={{width: 380}}
                onClose={handleOnClose}
            >
                {content}
            </DEPRECATED_Modal>
        </>
    )
}
