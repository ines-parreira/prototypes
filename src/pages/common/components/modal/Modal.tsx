import React, {
    createContext,
    ReactNode,
    useCallback,
    useMemo,
    useState,
    useRef,
    MouseEvent,
} from 'react'
import {createPortal} from 'react-dom'
import {CSSTransition} from 'react-transition-group'
import classnames from 'classnames'
import {useKey} from 'react-use'

import useId from 'hooks/useId'

import css from './Modal.less'

type Props = {
    animation?: 'default' | 'none'
    children: ReactNode
    className?: string
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
} & Pick<Props, 'id' | 'isScrollable' | 'onClose'>

export const ModalContext = createContext<ModalContextState>({
    isScrollable: false,
    onClose: () => ({}),
})

const Modal = ({
    animation = 'default',
    children,
    className,
    container = document.body,
    id,
    isClosable = true,
    isOpen,
    isScrollable = false,
    onClose,
    size,
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [bounceModal, setBounceModal] = useState(false)
    const randomId = useId()
    const modalId = id || 'modal-' + randomId
    const bodyId = `${modalId}-desc`
    const labelId = `${modalId}-title`

    const handleCloseRequest = useCallback(() => {
        if (isClosable) {
            onClose()
        } else {
            setBounceModal(true)
        }
    }, [isClosable, onClose])

    useKey('Escape', handleCloseRequest, undefined, [isClosable])

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
            labelId,
            onClose,
        }),
        [bodyId, id, isScrollable, labelId, onClose]
    )

    const modal = (
        <ModalContext.Provider value={contextValue}>
            <CSSTransition
                in={isOpen}
                unmountOnExit
                timeout={{enter: 0, exit: 300}}
                classNames={{
                    enterDone: css.enterDone,
                    exit: css.exit,
                }}
            >
                <div
                    className={classnames(
                        css.modal,
                        {[css[animation]]: animation !== 'none'},
                        className
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={labelId}
                    aria-describedby={bodyId}
                    onClick={handleClose}
                >
                    <div
                        className={classnames(css.dialog, {
                            [css[size!]]: !!size,
                            [css.scrollableDialog]: isScrollable,
                        })}
                    >
                        <div
                            ref={ref}
                            className={classnames(css.modalContent, {
                                [css.scrollableContent]: isScrollable,
                                [css.bounceModal]: bounceModal,
                                [css[animation]]: animation !== 'none',
                            })}
                            onTransitionEnd={() => setBounceModal(false)}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </ModalContext.Provider>
    )

    return createPortal(modal, container)
}

export default Modal
