import React, { useState } from 'react'

import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { Button } from '@gorgias/axiom'

import { EmailMigrationSenderVerificationIntegration } from 'models/integration/types'
import { SenderInformation } from 'models/singleSenderVerification/types'
import IconButton from 'pages/common/components/button/IconButton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import DeleteVerificationModal from '../DeleteVerificationModal'
import EmailVerificationStatusLabel, {
    EmailVerificationStatus,
} from '../EmailVerificationStatusLabel'
import useCreateSingleSenderVerification from '../hooks/useCreateSingleSenderVerification'
import useDeleteSingleSenderVerification from '../hooks/useDeleteSingleSenderVerification'
import EmailVerificationButton from './EmailVerificationButton'
import SingleSenderVerificationFormModal from './SingleSenderVerificationFormModal'
import { computeSingleSenderVerificationStatus } from './utils'

import css from './SingleSenderVerificationTable.less'

export type Props = {
    integration: EmailMigrationSenderVerificationIntegration
    hasSubmittedBulkVerification: boolean
    refreshMigrationData: () => void
}

export default function SingleSenderVerificationTableRow({
    integration,
    hasSubmittedBulkVerification,
    refreshMigrationData,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)

    const { isLoading: isDeleteInProgress, deleteVerification } =
        useDeleteSingleSenderVerification()
    const { isLoading: isCreateInProgress, createVerification } =
        useCreateSingleSenderVerification()

    const status = computeSingleSenderVerificationStatus(integration)
    const isCollapsible =
        status === EmailVerificationStatus.Failed ||
        status === EmailVerificationStatus.Pending

    const { address, city, state, zip, country } =
        integration.sender_verification ?? {}
    const stateAndZipString = [state, zip].filter(Boolean).join(' ')

    const canDeleteVerification = isCollapsible && isExpanded

    const handleConfirmDelete = async () => {
        await deleteVerification(integration.id)
        refreshMigrationData()
    }

    const handleRetryClick = async () => {
        const email = integration.meta.address

        if (
            isEmpty(integration.sender_verification) ||
            !address ||
            !city ||
            !country
        ) {
            setIsFormModalOpen(true)
            return
        }

        await createVerification(integration.id, {
            address,
            city,
            country,
            state,
            zip,
            email,
        })
        refreshMigrationData()
    }

    const handleConfirmSubmit = async (values: SenderInformation) => {
        await createVerification(integration.id, values)
        setIsFormModalOpen(false)
        refreshMigrationData()
    }

    return (
        <>
            <BodyCell colSpan={3} innerClassName={css.rowContent}>
                <div className={css.rowSummary}>
                    <div
                        className={classNames(css.emailAddress, {
                            [css.error]:
                                status === EmailVerificationStatus.Failed,
                        })}
                    >
                        {integration.meta.address}
                    </div>

                    <div className={css.status}>
                        <EmailVerificationStatusLabel status={status} />
                    </div>
                    <div className={css.actionContainer}>
                        {hasSubmittedBulkVerification && (
                            <EmailVerificationButton
                                status={status}
                                isLoading={
                                    isCreateInProgress || isDeleteInProgress
                                }
                                linkButtonText="Submit address"
                                onLinkButtonClick={() =>
                                    setIsFormModalOpen(true)
                                }
                                onRetryClick={handleRetryClick}
                            />
                        )}
                        {isCollapsible && (
                            <IconButton
                                fillStyle="ghost"
                                intent="secondary"
                                onClick={() =>
                                    setIsExpanded((current) => !current)
                                }
                                data-testid="toggle-sender-details-visible"
                            >
                                {isExpanded
                                    ? 'arrow_drop_up'
                                    : 'arrow_drop_down'}
                            </IconButton>
                        )}
                    </div>
                </div>
                {canDeleteVerification && (
                    <div className={css.collapsibleContent}>
                        <div data-testid="address-container">
                            <div>{address}</div>
                            <div>
                                {[city, stateAndZipString]
                                    .filter(Boolean)
                                    .join(', ')}
                            </div>
                            <div>{country}</div>
                        </div>
                        <Button
                            intent="destructive"
                            fillStyle="ghost"
                            onClick={() => setIsDeleteModalOpen(true)}
                            data-testid="delete-verification-button"
                            leadingIcon="delete"
                        >
                            Delete verification
                        </Button>
                    </div>
                )}
            </BodyCell>
            {isEmpty(integration.sender_verification) && (
                <SingleSenderVerificationFormModal
                    isOpen={isFormModalOpen}
                    setIsOpen={setIsFormModalOpen}
                    initialValues={{
                        email: integration.meta.address,
                    }}
                    onConfirm={handleConfirmSubmit}
                    isLoading={isCreateInProgress}
                />
            )}
            {canDeleteVerification && (
                <DeleteVerificationModal
                    isOpen={isDeleteModalOpen}
                    setIsOpen={setIsDeleteModalOpen}
                    onConfirm={handleConfirmDelete}
                    isLoading={isDeleteInProgress}
                >
                    If you delete verification, you will not be able to send
                    outbound messages with this email and complete migration.
                </DeleteVerificationModal>
            )}
        </>
    )
}
