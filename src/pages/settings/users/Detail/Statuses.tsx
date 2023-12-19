import React, {useState} from 'react'

import {User} from 'config/types/user'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import TwoFactorAuthenticationDisableModal from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationDisableModal'

import css from './Detail.less'
import {OwnershipModal} from './OwnershipModal'

type props = {
    agentId: number
    has2FA: boolean | undefined
    set2FA: (arg1: boolean) => void
    rawData: User | undefined
    isAccountOwner: boolean
    isViewingAccountOwner: boolean
}

export const Statuses = ({
    agentId,
    rawData,
    has2FA,
    set2FA,
    isAccountOwner,
    isViewingAccountOwner,
}: props) => {
    const [is2FAModalOpen, set2FAModalOpen] = useState(false)
    const [isOwnershipModalOpen, setOwnershipModalOpen] = useState(false)
    return (
        <>
            <div className={css.statuses}>
                <div className={css.alignCenter}>
                    <Badge
                        className="mr-2"
                        type={
                            has2FA
                                ? ColorType.LightSuccess
                                : ColorType.LightError
                        }
                    >
                        2FA {has2FA ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {has2FA && (
                        <Button
                            type="button"
                            fillStyle="ghost"
                            intent="primary"
                            onClick={() => set2FAModalOpen(true)}
                        >
                            <ButtonIconLabel icon="update">
                                Reset 2FA Token
                            </ButtonIconLabel>
                        </Button>
                    )}
                    {isViewingAccountOwner && (
                        <Badge className="ml-2" type={ColorType.Blue}>
                            Account Owner
                        </Badge>
                    )}
                </div>
                {isAccountOwner && !isViewingAccountOwner && (
                    <div>
                        <Button
                            type="button"
                            fillStyle="ghost"
                            intent="primary"
                            className="ml-2"
                            onClick={() => setOwnershipModalOpen(true)}
                        >
                            <ButtonIconLabel icon="account_balance">
                                Set as Account Owner
                            </ButtonIconLabel>
                        </Button>
                        <OwnershipModal
                            isModalOpen={isOwnershipModalOpen}
                            setModalOpen={setOwnershipModalOpen}
                            agentId={agentId}
                            name={rawData?.name || ''}
                        />
                    </div>
                )}
            </div>
            {is2FAModalOpen && (
                <TwoFactorAuthenticationDisableModal
                    user={rawData}
                    title="Reset 2FA Token?"
                    actionButtonText="Reset token"
                    isOpen={is2FAModalOpen}
                    onClose={() => set2FAModalOpen(false)}
                    onSuccess={() => {
                        set2FAModalOpen(false)
                        set2FA(false)
                    }}
                >
                    If you enforced Two-Factor Authentication (2FA) for all
                    users, <b>{rawData?.name || ''}</b> will have to setup 2FA
                    again.
                </TwoFactorAuthenticationDisableModal>
            )}
        </>
    )
}
