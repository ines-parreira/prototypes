import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import { ActivationProgress } from './ActivationProgress'
import { AiAgentActivationStoreCard } from './AiAgentActivationStoreCard'

import css from './AiAgentActivationModal.less'

const StoreCard = AiAgentActivationStoreCard

const computeActivationScore = (
    storeConfigs: StoreConfiguration[],
): [number, number] => {
    const totalStores = storeConfigs.length
    const totalScore = totalStores * 3

    const currentScore = storeConfigs.reduce((score, config) => {
        let storeScore = 0
        if (config.scopes.includes(AiAgentScope.Sales)) storeScore += 1
        if (config.scopes.includes(AiAgentScope.Support)) {
            if (!config.chatChannelDeactivatedDatetime) storeScore += 1
            if (!config.emailChannelDeactivatedDatetime) storeScore += 1
        }
        return score + storeScore
    }, 0)

    return [currentScore, totalScore]
}

type Props = {
    isOpen: boolean
    onClose: () => void
    storeConfigs: StoreConfiguration[]
    onToggleSales: (storeName: string, newValue: boolean) => void
    onToggleSupport: (storeName: string, newValue: boolean) => void
    onToggleSupportChat: (storeName: string, newValue: boolean) => void
    onToggleSupportEmail: (storeName: string, newValue: boolean) => void
}
export const AiAgentActivationModal = ({
    isOpen,
    onClose,
    storeConfigs,
    onToggleSales,
    onToggleSupport,
    onToggleSupportChat,
    onToggleSupportEmail,
}: Props) => {
    const [currentScore, totalScore] = computeActivationScore(storeConfigs)
    const progressPercentage = Math.round((currentScore / totalScore) * 100)
    return (
        <Modal
            className={css.modal}
            classNameContent={css.modalContent}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className={css.modalHeader}>
                <div className={css.modalTitle}>Manage AI Agent Activation</div>
                <div className={css.activationStatus}>
                    <ActivationProgress percentage={progressPercentage} />
                </div>
            </div>

            <ModalBody className={css.modalBody}>
                <div className={css.storeCardsList}>
                    {storeConfigs.map((config) => (
                        <StoreCard
                            key={config.storeName}
                            store={{
                                name: config.storeName,
                                title: config.storeName,
                                sales: {
                                    enabled: config.scopes.includes(
                                        AiAgentScope.Sales,
                                    ),
                                    onToggle: (value) =>
                                        onToggleSales(config.storeName, value),
                                },
                                support: {
                                    onToggle: (value) =>
                                        onToggleSupport(
                                            config.storeName,
                                            value,
                                        ),
                                    chat: {
                                        enabled:
                                            config.scopes.includes(
                                                AiAgentScope.Support,
                                            ) &&
                                            !config.chatChannelDeactivatedDatetime,
                                        onToggle: (value) =>
                                            onToggleSupportChat(
                                                config.storeName,
                                                value,
                                            ),
                                        isIntegrationMissing:
                                            config.monitoredChatIntegrations
                                                .length === 0,
                                    },
                                    email: {
                                        enabled:
                                            config.scopes.includes(
                                                AiAgentScope.Support,
                                            ) &&
                                            !config.emailChannelDeactivatedDatetime,
                                        onToggle: (value) =>
                                            onToggleSupportEmail(
                                                config.storeName,
                                                value,
                                            ),
                                        isIntegrationMissing:
                                            config.monitoredEmailIntegrations
                                                .length === 0,
                                    },
                                },
                            }}
                            alerts={[]}
                        />
                    ))}
                </div>
            </ModalBody>

            <div className={css.footer}>
                <Button onClick={onClose}>Close</Button>
            </div>
        </Modal>
    )
}
