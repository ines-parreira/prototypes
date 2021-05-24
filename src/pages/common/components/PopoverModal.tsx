import classnames from 'classnames'
import React, {useRef, useState, ReactNode, RefObject} from 'react'
import {
    Button,
    Popover,
    PopoverHeader,
    PopoverBody,
    PopoverProps,
} from 'reactstrap'

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
                innerRef={ref}
                color="secondary"
                type="button"
                onClick={togglePopover}
            >
                <div className={css.content}>
                    <i className={classnames(css.icon, 'material-icons')}>
                        info_outline
                    </i>
                    <span className={classnames(css.label, 'ml-1')}>
                        {buttonText}
                    </span>
                </div>
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
