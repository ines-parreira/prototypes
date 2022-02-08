import classnames from 'classnames'
import React, {useRef, useState, ReactNode, RefObject} from 'react'
import {Popover, PopoverHeader, PopoverBody, PopoverProps} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

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

    const togglePopover = () => {
        setOpen(!isOpen)
    }
    return (
        <>
            <Button
                className={classnames(css.wrapper, className)}
                ref={ref}
                intent={ButtonIntent.Secondary}
                type="button"
                onClick={togglePopover}
            >
                <ButtonIconLabel icon="info_outline">
                    {buttonText}
                </ButtonIconLabel>
            </Button>
            {isOpen && <div className={css.backdrop} />}
            {ref.current && (
                <Popover
                    className={css.popover}
                    trigger="legacy"
                    placement={placement}
                    isOpen={isOpen}
                    target={ref.current}
                    toggle={togglePopover}
                >
                    {header && <PopoverHeader>{header}</PopoverHeader>}
                    <PopoverBody>{children}</PopoverBody>
                </Popover>
            )}
        </>
    )
}

export default PopoverModal
