import React, {
    createContext,
    ForwardedRef,
    forwardRef,
    MouseEvent,
    ReactNode,
    RefObject,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import {createPortal} from 'react-dom'
import classnames from 'classnames'
import {useKey} from 'react-use'

import useId from 'hooks/useId'

import {AppUIContext} from 'providers/ui/AppUIContext'
import css from './Modal.less'

type Props = {
    animation?: 'default' | 'none'
    children: ReactNode
    className?: string
    classNameDialog?: string
    classNameContent?: string
    container?: Element
    id?: string
    isClosable?: boolean
    isOpen: boolean
    isScrollable?: boolean
    onClose: () => void
    size?: 'small' | 'medium' | 'large' | 'huge'
}

type ModalContextState = {
    bodyId?: string
    labelId?: string
    ref?: RefObject<HTMLDivElement>
} & Pick<Props, 'id' | 'isScrollable' | 'onClose' | 'isClosable'>

export const ModalContext = createContext<ModalContextState>({
    isScrollable: false,
    onClose: () => ({}),
})

const Modal = (
    {
        animation = 'default',
        children,
        className,
        classNameDialog,
        classNameContent,
        container,
        id,
        isClosable = true,
        isOpen,
        isScrollable = false,
        onClose,
        size,
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>
) => {
    const ref = useRef<HTMLDivElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    const appUIContext = useContext(AppUIContext)
    const containerNode = useMemo(
        () => container ?? appUIContext.appRef?.current ?? document.body,
        [appUIContext, container]
    )
    const containerNodeRef = useRef(containerNode)
    if (containerNode) {
        containerNodeRef.current = containerNode
    }

    const [bounceModal, setBounceModal] = useState(false)
    const randomId = useId()
    const modalId = id || 'modal-' + randomId
    const bodyId = `${modalId}-desc`
    const labelId = `${modalId}-title`

    const handleCloseRequest = useCallback(() => {
        if (isOpen) {
            if (isClosable) {
                onClose()
            } else {
                setBounceModal(true)
            }
        }
    }, [isClosable, isOpen, onClose])

    useKey('Escape', handleCloseRequest, undefined, [handleCloseRequest])

    const handleClose = useCallback(
        (event: MouseEvent) => {
            if (ref.current?.contains(event.target as Node)) {
                return
            }
            handleCloseRequest()
        },
        [handleCloseRequest]
    )
    const contextValue = useMemo(
        () => ({
            bodyId,
            id,
            isScrollable,
            isClosable,
            labelId,
            onClose,
            ref,
        }),
        [bodyId, id, isScrollable, isClosable, labelId, onClose, ref]
    )

    const modal = (
        <ModalContext.Provider value={contextValue}>
            <div
                className={classnames(css.modal, className, {
                    [css[animation]]: animation !== 'none',
                    [css.open]: isOpen,
                })}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelId}
                aria-describedby={bodyId}
                onClick={handleClose}
            >
                <div
                    className={classnames(
                        css.dialog,
                        {
                            [css[size!]]: !!size,
                            [css.scrollableDialog]: isScrollable,
                        },
                        classNameDialog
                    )}
                >
                    <div
                        ref={ref}
                        className={classnames(
                            css.modalContent,
                            {
                                [css.scrollableContent]: isScrollable,
                                [css.bounceModal]: bounceModal,
                                [css[animation]]: animation !== 'none',
                            },
                            classNameContent
                        )}
                        onTransitionEnd={() => setBounceModal(false)}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </ModalContext.Provider>
    )

    return createPortal(modal, containerNodeRef.current)
}

export default forwardRef(Modal)
