import React, {
    ComponentProps,
    MutableRefObject,
    ReactNode,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {useMountedState} from 'react-use'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import _get from 'lodash/get'

import Button from 'pages/common/components/button/Button'
import {GroupPositionContext} from 'pages/common/components/layout/Group'

type Props = {
    buttonProps?: ComponentProps<typeof Button>
    children: (props: {
        uid: string
        onDisplayConfirmation: (event: SyntheticEvent) => void
        elementRef: MutableRefObject<any>
    }) => ReactNode
    content?: ReactNode
    id?: string
    onConfirm?: () => void
    placement?: ComponentProps<typeof Popover>['placement']
    title?: ReactNode
    confirmLabel?: string
} & Omit<ComponentProps<typeof Popover>, 'target'>

export default function ConfirmationPopover({
    buttonProps,
    children,
    content,
    id,
    isOpen,
    onConfirm,
    placement = 'bottom',
    title = 'Are you sure?',
    confirmLabel = 'Confirm',
    ...other
}: Props) {
    const isMounted = useMountedState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const uid = useMemo(() => id || `confirm-${Date.now()}`, [])
    const [isOpened, setIsOpened] = useState(false)
    const elementRef = useRef<HTMLElement | null>(null)
    const hideTimeoutRef = useRef<number | null>(null)
    const container = useMemo(
        () =>
            buttonProps?.type === 'submit'
                ? elementRef.current?.parentElement || undefined
                : undefined,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [elementRef.current]
    )

    useEffect(
        () => () => {
            if (hideTimeoutRef.current) {
                window.clearTimeout(hideTimeoutRef.current)
            }
        },
        []
    )

    const handleDisplayConfirmation = useCallback((event: SyntheticEvent) => {
        if (buttonProps?.type === 'submit') {
            const form: HTMLFormElement = _get(event, ['target', 'form'])

            if (form && !form.checkValidity()) {
                return
            }
        }
        event.preventDefault()
        event.stopPropagation()
        setIsOpened(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {children({
                uid,
                onDisplayConfirmation: handleDisplayConfirmation,
                elementRef,
            })}

            {isMounted() && (
                <Popover
                    container={container}
                    isOpen={isOpen || isOpened}
                    placement={placement}
                    target={uid}
                    onClick={(event) => event.stopPropagation()}
                    toggle={() => setIsOpened(false)}
                    trigger="legacy"
                    {...other}
                >
                    <PopoverHeader>{title}</PopoverHeader>

                    <PopoverBody>
                        <p>{content}</p>
                        <GroupPositionContext.Provider value={null}>
                            <Button
                                {...buttonProps}
                                onClick={handleConfirmation}
                            >
                                {confirmLabel}
                            </Button>
                        </GroupPositionContext.Provider>
                    </PopoverBody>
                </Popover>
            )}
        </>
    )
}
