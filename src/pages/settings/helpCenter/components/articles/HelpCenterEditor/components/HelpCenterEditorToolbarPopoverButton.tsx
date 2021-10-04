import React, {useEffect, useRef} from 'react'
import ReactDOM from 'react-dom'

import Popover from '../../../../../../common/draftjs/plugins/toolbar/components/Popover'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'

type Props = {
    icon: string
    active?: boolean
    disabled?: boolean
    onOpen: () => void
    onClose: () => void
    children: JSX.Element
    isOpen: boolean
    tooltip?: string
}

export const HelpCenterEditorToolbarPopoverButton = ({
    onOpen,
    onClose,
    active,
    disabled,
    icon,
    children,
    isOpen,
    tooltip,
}: Props) => {
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('click', onDocumentClick)
        }

        return () => {
            document.removeEventListener('click', onDocumentClick)
        }
    }, [isOpen])

    const popover = useRef(null)

    const onDocumentClick = (e: MouseEvent) => {
        if (!popover?.current || !isOpen || !e.target) {
            return
        }

        const target = e.target as Node
        const popoverInner = document.querySelector('.popover-inner') as Node
        const popoverEl = ReactDOM.findDOMNode(popover.current)

        if (
            popoverEl instanceof Element &&
            !popoverEl.contains(target) &&
            !popoverInner?.contains(target)
        ) {
            onClose()
        }
    }

    const toggle = () => {
        isOpen ? onClose() : onOpen()
    }

    return (
        <Popover
            trigger={
                <HelpCenterEditorToolbarButton
                    icon={icon}
                    active={active}
                    disabled={disabled}
                    onClick={toggle}
                    tooltip={tooltip}
                />
            }
            position="bottom-right"
            isOpen={isOpen}
            ref={popover}
        >
            {children}
        </Popover>
    )
}
