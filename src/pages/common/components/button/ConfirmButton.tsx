import React, {
    ComponentProps,
    MouseEvent,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import _get from 'lodash/get'
import {useMountedState} from 'react-use'

import Button from './Button'

type Props = {
    confirmationContent?: ReactNode
    confirmationTitle?: string
    onConfirm?: () => void
    placement?: ComponentProps<typeof Popover>['placement']
} & ComponentProps<typeof Button>

export default function ConfirmButton({
    children,
    confirmationContent,
    confirmationTitle = 'Are you sure?',
    id,
    onConfirm,
    placement = 'bottom',
    type = 'submit',
    ...other
}: Props) {
    const isMounted = useMountedState()
    const uid = useMemo(() => id || `confirm-${Date.now()}`, [])
    const [isOpened, setIsOpened] = useState(false)
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const hideTimeoutRef = useRef<number | null>(null)
    const container = useMemo(
        () =>
            type === 'submit'
                ? buttonRef.current?.parentElement || undefined
                : undefined,
        [buttonRef.current]
    )

    useEffect(
        () => () => {
            if (hideTimeoutRef.current) {
                window.clearTimeout(hideTimeoutRef.current)
            }
        },
        []
    )

    const handleDisplayConfirmation = useCallback((e: MouseEvent) => {
        if (type === 'submit') {
            const form: HTMLFormElement = _get(e, ['target', 'form'])

            if (form && !form.checkValidity()) {
                return
            }
        }
        e.preventDefault()
        e.stopPropagation()
        setIsOpened(true)
    }, [])

    const handleConfirmation = useCallback(() => {
        if (onConfirm) {
            onConfirm()
        }

        hideTimeoutRef.current = window.setTimeout(() => {
            setIsOpened(false)
        }, 20)
    }, [onConfirm])

    return (
        <>
            <Button
                {...other}
                id={uid}
                onClick={handleDisplayConfirmation}
                ref={buttonRef}
                type="button"
            >
                {children}
            </Button>

            {isMounted && (
                <Popover
                    container={container}
                    isOpen={isOpened}
                    placement={placement}
                    target={uid}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    toggle={() => setIsOpened(false)}
                    trigger="legacy"
                >
                    <PopoverHeader>{confirmationTitle}</PopoverHeader>

                    <PopoverBody>
                        <p>{confirmationContent}</p>

                        <Button onClick={handleConfirmation} type={type}>
                            Confirm
                        </Button>
                    </PopoverBody>
                </Popover>
            )}
        </>
    )
}
