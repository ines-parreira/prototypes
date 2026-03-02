import type { ComponentProps, ReactNode, SyntheticEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { useId, useIsMounted } from '@repo/hooks'
import classnames from 'classnames'
import _get from 'lodash/get'
import { Popover, PopoverBody, PopoverHeader } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { LegacyButtonComponentProps as ButtonComponentProps } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import { GroupPositionContext } from 'pages/common/components/layout/Group'

import css from './ConfirmationPopover.less'

type Props = {
    buttonProps?: Omit<ButtonComponentProps, 'children'>
    cancelButtonProps?: Omit<ButtonComponentProps, 'children'>
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
    const isMounted = useIsMounted()
    const randomId = useId()
    const uid = id || `confirm-${randomId}`
    const [isOpened, setIsOpened] = useState(false)
    const [element, setElement] = useState<HTMLElement | null>(null)
    const onElementChange = useCallback((element: HTMLElement | null) => {
        setElement(element)
    }, [])
    const appNode = useAppNode()
    const rootElement = appNode ?? undefined

    const container = useMemo(
        () =>
            containerElement ??
            (buttonProps?.type === 'submit'
                ? element?.parentElement || rootElement
                : rootElement),
        [buttonProps?.type, containerElement, element, rootElement],
    )

    const handleDisplayConfirmation = useCallback(
        (event?: SyntheticEvent) => {
            if (buttonProps?.type === 'submit') {
                const form: HTMLFormElement = _get(event, ['target', 'form'])

                if (form && !form.checkValidity()) {
                    return
                }
            }
            event?.preventDefault()
            event?.stopPropagation()
            setIsOpened(true)
        },
        [buttonProps?.type],
    )

    const handleConfirmation = () => {
        onConfirm?.()
        setIsOpened(false)
    }

    const handleCancellation = () => {
        onCancel?.()
        setIsOpened(false)
    }

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
                    className="popoverDark"
                    isOpen={isOpen || isOpened}
                    placement={placement}
                    target={uid}
                    onClick={(event) => event.stopPropagation()}
                    toggle={handleCancellation}
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
                                        cancelButtonProps?.className,
                                    )}
                                    onClick={handleCancellation}
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
