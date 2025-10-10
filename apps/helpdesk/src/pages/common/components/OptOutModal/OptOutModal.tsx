import React, { createContext, useContext } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './OptOutModal.less'

/**
 * OptOutModal - A compound component for displaying opt-out modals

 *
 * @example
 * <OptOutModal
 *   title="Opt out of upgrade?"
 *   isLoading={isLoading}
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onOptOut={onOptOut}
 *   onDismiss={onDismiss}
 * >
 *   <OptOutModal.Body>
 *     Please don't leave us!
 *   </OptOutModal.Body>
 *   <OptOutModal.Actions>
 *     <OptOutModal.SecondaryAction>
 *       Request Trial Extension
 *     </OptOutModal.SecondaryAction>
 *     <OptOutModal.DestructiveAction>
 *       Opt Out Anyway
 *     </OptOutModal.DestructiveAction>
 *   </OptOutModal.Actions>
 * </OptOutModal>
 */

interface OptOutModalContextType {
    isLoading: boolean
    onOptOut: () => void
    onDismiss: () => void
}

const OptOutModalContext = createContext<OptOutModalContextType | undefined>(
    undefined,
)

const useOptOutModalContext = () => {
    const context = useContext(OptOutModalContext)
    if (!context) {
        throw new Error(
            'OptOutModal compound components must be used within OptOutModal',
        )
    }
    return context
}

interface OptOutModalRootProps {
    children: React.ReactNode
    title: string
    isLoading: boolean
    isOpen: boolean
    onOptOut: () => void
    onClose: () => void
    onDismiss: () => void
}

const OptOutModalRoot = ({
    children,
    title,
    isLoading,
    isOpen,
    onOptOut,
    onClose,
    onDismiss,
}: OptOutModalRootProps) => {
    return (
        <OptOutModalContext.Provider
            value={{
                isLoading,
                onOptOut,
                onDismiss,
            }}
        >
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="medium"
                classNameContent={css.modalContent}
            >
                <ModalHeader className={css.header} title={title} />
                {children}
            </Modal>
        </OptOutModalContext.Provider>
    )
}

interface BodyProps {
    children?: React.ReactNode
}

const Body = ({ children }: BodyProps) => {
    return <ModalBody className={css.body}>{children}</ModalBody>
}

interface ActionsProps {
    children: React.ReactNode
}

const Actions = ({ children }: ActionsProps) => {
    return <ModalFooter className={css.footer}>{children}</ModalFooter>
}

interface SecondaryActionProps {
    children: React.ReactNode
    id?: string
    isDisabled?: boolean
}

const SecondaryAction = ({
    children,
    id,
    isDisabled,
}: SecondaryActionProps) => {
    const { onDismiss } = useOptOutModalContext()

    return (
        <Button
            onClick={onDismiss}
            fillStyle="ghost"
            intent="secondary"
            id={id}
            isDisabled={isDisabled}
        >
            {children}
        </Button>
    )
}

interface DestructiveActionProps {
    children: React.ReactNode
    id?: string
}

const DestructiveAction = ({ children, id }: DestructiveActionProps) => {
    const { isLoading, onOptOut } = useOptOutModalContext()

    return (
        <Button
            onClick={onOptOut}
            isLoading={isLoading}
            intent="destructive"
            id={id}
        >
            {children}
        </Button>
    )
}

export const OptOutModal = Object.assign(OptOutModalRoot, {
    Body,
    Actions,
    SecondaryAction,
    DestructiveAction,
})

export type { OptOutModalRootProps as OptOutModalProps }
