import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { ActivationProgress } from 'pages/aiAgent/Activation/components/ActivationProgress/ActivationProgress'
import { AiAgentActivationStoreCard } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import {
    StoreConfigurationForActivation,
    useStoreActivations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './AiAgentActivationModal.less'

const StoreCard = AiAgentActivationStoreCard

type Props = {
    isOpen: boolean
    onClose: () => void
    storeConfigs: StoreConfigurationForActivation[]
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
    const {
        storeActivations,
        score: { totalScore, currentScore },
    } = useStoreActivations({
        storeConfigurations: storeConfigs,
    })
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
                    {storeActivations.map((store) => (
                        <StoreCard
                            key={store.name}
                            store={store}
                            alerts={[]}
                            onToggleSales={(value) =>
                                onToggleSales(store.name, value)
                            }
                            onToggleSupport={(value) =>
                                onToggleSupport(store.name, value)
                            }
                            onToggleSupportChat={(value) =>
                                onToggleSupportChat(store.name, value)
                            }
                            onToggleSupportEmail={(value) =>
                                onToggleSupportEmail(store.name, value)
                            }
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
