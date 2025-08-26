import React, { ReactNode, RefObject, useRef, useState } from 'react'

import classnames from 'classnames'
import { Popover, PopoverBody, PopoverHeader, PopoverProps } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import { useAppNode } from 'appNode'

import css from './PopoverModal.less'

type Props = {
    className?: string
    header?: string
    placement?: PopoverProps['placement']
    buttonText?: string
    children: ReactNode
}

const PopoverModal = ({
    className,
    buttonText = 'Learn',
    header,
    placement = 'auto',
    children,
}: Props) => {
    const ref: RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(null)
    const [isOpen, setOpen] = useState<boolean>(false)
    const appNode = useAppNode()

    const togglePopover = () => {
        setOpen(!isOpen)
    }
    return (
        <>
            <Button
                className={classnames(css.wrapper, className)}
                ref={ref}
                intent="secondary"
                onClick={togglePopover}
                leadingIcon="info_outline"
            >
                {buttonText}
            </Button>
            {isOpen && <div className={css.backdrop} />}
            {ref.current && (
                <Popover
                    className={classnames(css.popover, { darkPopover: header })}
                    trigger="legacy"
                    placement={placement}
                    isOpen={isOpen}
                    target={ref.current}
                    toggle={togglePopover}
                    container={appNode ?? undefined}
                >
                    {header && <PopoverHeader>{header}</PopoverHeader>}
                    <PopoverBody>{children}</PopoverBody>
                </Popover>
            )}
        </>
    )
}

export default PopoverModal
