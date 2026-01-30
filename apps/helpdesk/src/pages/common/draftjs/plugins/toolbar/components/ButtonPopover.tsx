import type { MouseEvent, ReactNode } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Popover } from 'reactstrap'

import { useAppNode } from 'appNode'
import { ModalContext } from 'pages/common/components/modal/Modal'

import Button from './Button'
import TourTooltip from './TourTooltip'

import css from './ButtonPopover.less'

type TourType = {
    text: string
}

type Props = {
    name: string
    icon: string
    tour?: TourType
    children: ReactNode
    className?: string
    isActive?: boolean
    isDisabled?: boolean
    isOpen?: boolean
    onClose: () => void
    onOpen: () => void
    toggleGuard?: (e: MouseEvent<any, globalThis.MouseEvent>) => boolean
}

export default function ButtonPopover({
    isActive = false,
    isDisabled = false,
    isOpen = false,
    tour = undefined,
    children,
    icon,
    name,
    onClose,
    onOpen,
    toggleGuard,
}: Props) {
    const [isTourOpen, setIsTourOpen] = useState<boolean>(
        tour ? !!tour.text : false,
    )

    useEffect(() => {
        if (isDisabled && isOpen) {
            onClose()
        }
    }, [isDisabled, isOpen, onClose])

    const handleButtonToggle = useCallback(() => {
        if (isTourOpen) {
            setIsTourOpen(false)
        }

        if (isOpen) {
            onClose()
        } else {
            onOpen()
        }
    }, [isTourOpen, isOpen, onClose, onOpen])

    const buttonRef = useRef<HTMLButtonElement>(null)
    const appNode = useAppNode()

    // on mobile size the editor toolbar becomes hidden, we force closing the popover if opened
    useEffect(() => {
        function closePopoverIfToolbarHidden() {
            // https://stackoverflow.com/a/53068496/19941479
            const toolbarIsVisible = !!buttonRef.current?.offsetParent
            if (!toolbarIsVisible && isOpen) {
                onClose()
            }
        }
        window.addEventListener('resize', closePopoverIfToolbarHidden)
        return () => {
            window.removeEventListener('resize', closePopoverIfToolbarHidden)
        }
    }, [isOpen, onClose, buttonRef])

    return (
        <>
            {tour ? (
                <TourTooltip isOpen={isTourOpen} text={tour.text}>
                    <Button
                        ref={buttonRef}
                        name={name}
                        isActive={isActive}
                        isDisabled={isDisabled}
                        icon={icon}
                        onToggle={handleButtonToggle}
                    />
                </TourTooltip>
            ) : (
                <Button
                    ref={buttonRef}
                    name={name}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    icon={icon}
                    onToggle={handleButtonToggle}
                />
            )}

            <ModalContext.Consumer>
                {(context) => (
                    <Popover
                        isOpen={isOpen}
                        toggle={(e) => {
                            if (toggleGuard?.(e)) return
                            handleButtonToggle()
                        }}
                        target={buttonRef}
                        className={css.popover}
                        container={context.ref ?? appNode ?? undefined}
                        trigger="legacy"
                        placement="right-end"
                        data-react-aria-top-layer="true"
                    >
                        {children}
                    </Popover>
                )}
            </ModalContext.Consumer>
        </>
    )
}
