import React, {
    ComponentProps,
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
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import {GroupPositionContext} from 'pages/common/components/layout/Group'
import useId from 'hooks/useId'

import css from './ConfirmationPopover.less'

type Props = {
    buttonProps?: ComponentProps<typeof Button>
    cancelButtonProps?: ComponentProps<typeof Button>
    children: (props: {
        uid: string
        onDisplayConfirmation: (event?: SyntheticEvent) => void
        elementRef: (element: HTMLElement | null) => void
    }) => ReactNode
    content?: ReactNode
    id?: string
    onConfirm?: () => void
    onCancel?: () => void
    placement?: ComponentProps<typeof Popover>['placement']
    title?: ReactNode
    confirmLabel?: string
    cancelLabel?: string
    showCancelButton?: boolean
    containerElement?: HTMLElement | null
} & Omit<ComponentProps<typeof Popover>, 'target'>

export default function ConfirmationPopover({
    buttonProps,
    cancelButtonProps,
    children,
    content,
    id,
    isOpen,
    onConfirm,
    onCancel,
    placement = 'bottom',
    title = 'Are you sure?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    showCancelButton,
    containerElement,
    ...other
}: Props) {
    const isMounted = useMountedState()
    const randomId = useId()
    const uid = id || `confirm-${randomId}`
    const [isOpened, setIsOpened] = useState(false)
    const [element, setElement] = useState<HTMLElement | null>(null)
    const onElementChange = useCallback((element: HTMLElement | null) => {
        setElement(element)
    }, [])
    const hideTimeoutRef = useRef<number | null>(null)
    const container = useMemo(
        () =>
            containerElement ??
            (buttonProps?.type === 'submit'
                ? element?.parentElement || undefined
                : undefined),
        [buttonProps?.type, containerElement, element]
    )

    useEffect(
        () => () => {
            if (hideTimeoutRef.current) {
                window.clearTimeout(hideTimeoutRef.current)
            }
        },
        []
    )

    const handleDisplayConfirmation = useCallback((event?: SyntheticEvent) => {
        if (buttonProps?.type === 'submit') {
            const form: HTMLFormElement = _get(event, ['target', 'form'])

            if (form && !form.checkValidity()) {
                return
            }
        }
        event?.preventDefault()
        event?.stopPropagation()
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
                elementRef: onElementChange,
            })}

            {isMounted() && (
                <Popover
                    container={container}
                    isOpen={isOpen || isOpened}
                    placement={placement}
                    target={uid}
                    onClick={(event) => event.stopPropagation()}
                    toggle={() => {
                        setIsOpened(false)
                        onCancel?.()
                    }}
                    trigger="legacy"
                    {...other}
                >
                    <PopoverHeader>{title}</PopoverHeader>

                    <PopoverBody>
                        <div className={css.content}>{content}</div>
                        <GroupPositionContext.Provider value={null}>
                            <Button
                                {...buttonProps}
                                onClick={handleConfirmation}
                            >
                                {confirmLabel}
                            </Button>
                            {showCancelButton && (
                                <Button
                                    {...cancelButtonProps}
                                    className={classnames(
                                        css.cancelButton,
                                        cancelButtonProps?.className
                                    )}
                                    onClick={() => {
                                        setIsOpened(false)
                                        onCancel?.()
                                    }}
                                >
                                    {cancelLabel}
                                </Button>
                            )}
                        </GroupPositionContext.Provider>
                    </PopoverBody>
                </Popover>
            )}
        </>
    )
}
