import React, {ReactNode, useCallback, useEffect, useRef} from 'react'

import Button from './Button'
import Popover from './Popover'

type Props = {
    name: string
    icon: string
    children: ReactNode
    className?: string
    isActive?: boolean
    isDisabled?: boolean
    isOpen?: boolean
    onClose: () => void
    onOpen: () => void
    id: string
}

export default function ButtonPopover({
    isActive = false,
    isDisabled = false,
    className,
    isOpen = false,
    children,
    icon,
    name,
    onClose,
    onOpen,
    id,
}: Props) {
    const popoverRef = useRef<HTMLSpanElement>(null)
    const handleDocumentPointer = useCallback(
        (e: MouseEvent | TouchEvent) => {
            const target = e.target
            const popoverEl = popoverRef.current
            if (
                isOpen &&
                target &&
                popoverEl &&
                !popoverEl.contains(target as Node)
            ) {
                onClose()
            }
        },
        [isOpen, onClose]
    )
    useEffect(() => {
        if (isOpen) {
            // consider using pointer events
            document.body.addEventListener('mousedown', handleDocumentPointer)
            document.body.addEventListener('touchstart', handleDocumentPointer)
        }
        return function cleanUp() {
            document.body.removeEventListener(
                'mousedown',
                handleDocumentPointer
            )
            document.body.removeEventListener(
                'touchstart',
                handleDocumentPointer
            )
        }
    }, [isOpen, handleDocumentPointer])

    const handleButtonToggle = () => {
        if (isOpen) {
            onClose()
        } else {
            onOpen()
        }
    }
    return (
        <Popover
            trigger={
                <Button
                    name={name}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    icon={icon}
                    onToggle={handleButtonToggle}
                    id={id}
                />
            }
            className={className}
            isOpen={isOpen}
            ref={popoverRef}
        >
            {children}
        </Popover>
    )
}
