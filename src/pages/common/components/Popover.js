// @flow
//$FlowFixMe
import React, {useRef, useState, type Node} from 'react'
import {
    Button,
    Popover as ReactstrapPopover,
    PopoverHeader,
    PopoverBody,
} from 'reactstrap'

type Props = {
    header?: string,
    placement?: string,
    buttonText?: string,
    children: Node,
}

const Popover = ({
    buttonText = 'Learn more',
    header,
    placement = 'auto',
    children,
}: Props) => {
    const ref = useRef()
    const [isOpen, setOpen] = useState(false)

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
