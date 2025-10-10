import React, { useRef } from 'react'

import { ModalFooter } from 'reactstrap'

import { LegacyButton as Button, Tooltip } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin } from 'utils'

import css from './SubscriptionModalFooter.less'

type Props = {
    confirmLabel: string
    isUpdating: boolean
    isDisabled: boolean
    onClose: () => void
    onConfirm: () => void
}

const SubscriptionModalFooter = ({
    confirmLabel,
    isUpdating,
    isDisabled,
    onClose,
    onConfirm,
}: Props) => {
    const buttonWrapper = useRef<HTMLDivElement>(null)
    const currentUser = useAppSelector(getCurrentUser)
    const userIsAdmin = isAdmin(currentUser)

    return (
        <ModalFooter className={css.footer}>
            <Button intent="secondary" onClick={onClose}>
                Cancel
            </Button>
            <div ref={buttonWrapper}>
                <Button
                    isLoading={isUpdating}
                    onClick={onConfirm}
                    isDisabled={!userIsAdmin || isDisabled}
                >
                    {confirmLabel}
                </Button>
            </div>
            {!userIsAdmin && (
                <Tooltip target={buttonWrapper}>
                    Reach out to an admin to upgrade.
                </Tooltip>
            )}
        </ModalFooter>
    )
}

export default SubscriptionModalFooter
