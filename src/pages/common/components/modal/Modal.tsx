import React, {
    createContext,
    ForwardedRef,
    forwardRef,
    MouseEvent,
    ReactNode,
    RefObject,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import classnames from 'classnames'
import FocusTrap from 'focus-trap-react'
import { createPortal } from 'react-dom'
import { CSSTransition } from 'react-transition-group'

import { useAppNode } from 'appNode'
import useId from 'hooks/useId'
import useKey from 'hooks/useKey'

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
    forceFocus?: boolean
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
        forceFocus = false,
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) => {
    const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(
        null,
    )
    const ref = useRef<HTMLDivElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    const appNode = useAppNode()
    const containerNode = useMemo(
        () => container ?? appNode ?? document.body,
        [appNode, container],
    )
    const containerNodeRef = useRef(containerNode)
    if (containerNode) {
        containerNodeRef.current = containerNode
    }

    const randomId = useId()
    const modalId = id || 'modal-' + randomId
    const bodyId = `${modalId}-desc`
    const labelId = `${modalId}-title`

    useKey(
        'Escape',
        (event) => {
            if (isOpen && isClosable) {
                event.stopPropagation()

                onClose()
            }
        },
        { target: document.body },
        [isOpen, isClosable, onClose],
    )

    const handleClose = useCallback(
        (event: MouseEvent) => {
            if (
                !isClosable ||
                ref.current?.contains(event.target as Node) ||
                (mouseDownTarget && mouseDownTarget !== event.target)
            ) {
                return
            }
            event.stopPropagation()
            onClose()
        },
        [isClosable, onClose, mouseDownTarget],
    )

    // Make sure we don’t close the modal if the user has "mousedowned"
    // in the modal content but ended the click action outside of the modal
    const handleMouseDown = useCallback((event: MouseEvent) => {
        setMouseDownTarget(event.target)
    }, [])

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
        [bodyId, id, isScrollable, isClosable, labelId, onClose, ref],
    )

    const isFocusTrapActive = forceFocus && isOpen

    return (
        <CSSTransition
            in={isOpen}
            timeout={200}
            classNames={{
                enter: css.modalEnter,
                enterActive: css.modalEnterActive,
                exit: css.modalExit,
                exitActive: css.modalExitActive,
            }}
            mountOnEnter
            unmountOnExit
        >
            <>
                {createPortal(
                    <ModalContext.Provider value={contextValue}>
                        <FocusTrap active={isFocusTrapActive}>
                            <div
                                className={classnames(className, css.modal)}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby={labelId}
                                aria-describedby={bodyId}
                                onClick={handleClose}
                                onMouseDown={handleMouseDown}
                            >
                                <div
                                    className={classnames(
                                        css.dialog,
                                        {
                                            [css[size!]]: !!size,
                                            [css.scrollableDialog]:
                                                isScrollable,
                                        },
                                        classNameDialog,
                                    )}
                                >
                                    <div
                                        ref={ref}
                                        className={classnames(
                                            css.modalContent,
                                            {
                                                [css.scrollableContent]:
                                                    isScrollable,
                                            },
                                            classNameContent,
                                        )}
                                    >
                                        {children}
                                    </div>
                                </div>
                            </div>
                        </FocusTrap>
                    </ModalContext.Provider>,
                    containerNodeRef.current,
                )}
            </>
        </CSSTransition>
    )
}

export default forwardRef<HTMLDivElement, Props>(Modal)
