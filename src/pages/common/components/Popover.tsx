import React, {useRef, useState, ReactNode, RefObject} from 'react'
import {
    Button,
    Popover as ReactstrapPopover,
    PopoverHeader,
    PopoverBody,
    PopoverProps,
} from 'reactstrap'

type Props = {
    header?: string
    placement?: PopoverProps['placement']
    buttonText?: string
    children: ReactNode
}

const Popover = ({
    buttonText = 'Learn more',
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
                innerRef={ref}
                color="link"
                type="button"
                onClick={togglePopover}
            >
                <i className="material-icons">info_outline</i>
                <span className="ml-1">{buttonText}</span>
            </Button>
            {ref.current && (
                <ReactstrapPopover
                    trigger="legacy"
                    placement={placement}
                    isOpen={isOpen}
                    target={ref.current}
                    toggle={togglePopover}
                >
                    {header && <PopoverHeader>{header}</PopoverHeader>}
                    <PopoverBody>{children}</PopoverBody>
                </ReactstrapPopover>
            )}
        </>
    )
}

export default Popover
