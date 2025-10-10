import React, { memo, useMemo, useState } from 'react'

import { Avatar, LegacyButton as Button, Tooltip } from '@gorgias/axiom'

import { User } from 'config/types/user'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'

import css from './RequestTrialModal.less'

export type RequestTrialModalProps = {
    title: string
    subtitle: string
    accountAdmins: User[]
    primaryCTALabel: string
    isOpen: boolean
    onClose: () => void
    onPrimaryAction: (note?: string) => void
}

const ADMINS_COUNT_TO_SHOW = 4

const AdminItem = memo(({ admin }: { admin: User }) => (
    <div id={`admin-${admin.id}`} key={admin.id} className={css.adminItem}>
        <Avatar
            name={admin.name}
            url={admin.meta?.profile_picture_url || ''}
            size="sm"
            shape="circle"
        />
        <span className={css.adminName}>{admin.name}</span>
        <Tooltip target={`admin-${admin.id}`} placement="top-start">
            {admin.email}
        </Tooltip>
    </div>
))

const StackedAvatar = memo(({ admin }: { admin: User }) => (
    <div id={`remaining-admin-${admin.id}`} className={css.stackedAvatar}>
        <Avatar
            name={admin.name}
            url={admin.meta?.profile_picture_url || ''}
            size="sm"
            shape="circle"
        />
        <Tooltip target={`remaining-admin-${admin.id}`} placement="top-start">
            {admin.email}
        </Tooltip>
    </div>
))

const RemainingCount = memo(({ count }: { count: number }) => (
    <div>+{count} people</div>
))

const RequestTrialModal = ({
    title,
    subtitle,
    accountAdmins,
    primaryCTALabel,
    isOpen,
    onClose,
    onPrimaryAction,
}: RequestTrialModalProps) => {
    const [note, setNote] = useState('')

    const { visibleAdmins, remainingAdmins, remainingCount } = useMemo(() => {
        const visible = accountAdmins?.slice(0, ADMINS_COUNT_TO_SHOW) || []
        const remaining = accountAdmins?.slice(ADMINS_COUNT_TO_SHOW) || []
        return {
            visibleAdmins: visible,
            remainingAdmins: remaining,
            remainingCount: remaining.length,
        }
    }, [accountAdmins])

    const adminListContent = useMemo(() => {
        if (!accountAdmins || accountAdmins.length === 0) return null

        return (
            <div className={css.adminList}>
                {visibleAdmins.map((admin) => (
                    <AdminItem key={admin.id} admin={admin} />
                ))}
                {remainingCount > 0 && (
                    <div className={css.avatarStack}>
                        {remainingAdmins
                            .slice(0, ADMINS_COUNT_TO_SHOW)
                            .map((admin) => (
                                <StackedAvatar key={admin.id} admin={admin} />
                            ))}
                        {remainingCount > ADMINS_COUNT_TO_SHOW && (
                            <RemainingCount
                                count={remainingCount - ADMINS_COUNT_TO_SHOW}
                            />
                        )}
                    </div>
                )}
            </div>
        )
    }, [visibleAdmins, remainingAdmins, remainingCount, accountAdmins])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="medium"
            classNameContent={css.modalContent}
        >
            <ModalHeader title={title} className={css.header} />
            <ModalBody className={css.body}>
                <div className={css.subtitle}>{subtitle}</div>
                {adminListContent}

                <div className={css.noteSection}>
                    <InputField
                        label="Add a note (optional)"
                        value={note}
                        onChange={setNote}
                        className={css.noteInput}
                    />
                </div>
            </ModalBody>
            <ModalFooter className={css.footer}>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={onClose}
                    size="large"
                >
                    Cancel
                </Button>
                <Button
                    intent="primary"
                    onClick={() => onPrimaryAction(note.trim())}
                    className={css.primaryButton}
                    size="large"
                >
                    {primaryCTALabel}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default RequestTrialModal
