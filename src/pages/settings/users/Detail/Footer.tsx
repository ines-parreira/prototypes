import React from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { User } from 'config/types/user'
import Button from 'pages/common/components/button/Button'

import { navigateBackToUserList } from './constants'
import { DeleteModal } from './DeleteModal'
import { AgentState } from './types'

import css from './Detail.less'

type Props = {
    rawData: User | undefined
    agentState: AgentState
    isEdit: boolean
    agentId: number
    isSaving?: boolean
    isViewingAccountOwner?: boolean
    isSelf?: boolean
    isBotAgent?: boolean
}

export const Footer = ({
    rawData,
    agentState: { name, email, role },
    isEdit,
    agentId,
    isSaving = false,
    isSelf = false,
    isViewingAccountOwner = false,
    isBotAgent = false,
}: Props) => {
    const saveId = 'detail-footer-save-agent-button'
    const deleteId = 'detail-footer-delete-agent-button'
    const isDeleteDisabled = isViewingAccountOwner || isSelf
    const isSaveDisabled = isViewingAccountOwner && !isSelf
    const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false)
    const isMissingInfo = !name.trim() || !email.trim()
    const isSameInfo =
        isEdit &&
        name.trim() === rawData?.name.trim() &&
        email.trim() === rawData?.email.trim() &&
        role === rawData?.role.name

    return (
        <div className={css.footer}>
            <div>
                <Button
                    type="submit"
                    id={saveId}
                    className="mr-2"
                    isLoading={isSaving}
                    isDisabled={isMissingInfo || isSameInfo || isSaveDisabled}
                >
                    {isEdit ? 'Save Changes' : 'Create user'}
                </Button>
                {isSaveDisabled && (
                    <Tooltip target={saveId}>
                        You cannot edit account owner
                    </Tooltip>
                )}
                {!isSaving && (
                    <Button
                        type="button"
                        intent="secondary"
                        className="mr-2"
                        onClick={navigateBackToUserList}
                    >
                        Cancel
                    </Button>
                )}
            </div>
            {isEdit && !isBotAgent && (
                <>
                    <Button
                        id={deleteId}
                        type="button"
                        fillStyle="ghost"
                        intent="destructive"
                        onClick={() => setDeleteModalOpen(true)}
                        isDisabled={isDeleteDisabled}
                        leadingIcon="delete"
                    >
                        Delete user
                    </Button>
                    <DeleteModal
                        agentId={agentId}
                        name={name}
                        isModalOpen={isDeleteModalOpen}
                        setModalOpen={setDeleteModalOpen}
                    />
                    {isDeleteDisabled && (
                        <Tooltip target={deleteId} autohide={false}>
                            {isViewingAccountOwner ? (
                                <>
                                    To delete account owner, transfer account
                                    ownership to another user first.{' '}
                                    <a
                                        href="https://docs.gorgias.com/en-US/transfer-account-ownership-196940"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Learn more
                                    </a>
                                </>
                            ) : (
                                'You cannot delete your own profile'
                            )}
                        </Tooltip>
                    )}
                </>
            )}
        </div>
    )
}
