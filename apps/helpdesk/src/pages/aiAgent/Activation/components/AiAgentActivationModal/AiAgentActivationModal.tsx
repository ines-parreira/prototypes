import { useEffect, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'

import { LegacyButton as Button, LoadingSpinner } from '@gorgias/axiom'

import {
    atLeastOneStoreHasActiveTrialOnSpecificStores,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { ActivationProgress } from 'pages/aiAgent/Activation/components/ActivationProgress/ActivationProgress'
import { AiAgentActivationStoreCard } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { LegacyAiAgentActivationStoreCard } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/LegacyAiAgentActivationStoreCard'
import { AiAgentSalesBanner } from 'pages/aiAgent/Activation/components/AiAgentSalesBanner/AiAgentSalesBanner'
import AIAgentTrialSuccessModal from 'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

import css from './AiAgentActivationModal.less'

type Props = {
    isOpen: boolean
    isFetchLoading: boolean
    isSaveLoading: boolean
    onClose: () => void
    progressPercentage: number
    storeActivations: Record<string, StoreActivation>
    onSalesChange: (
        storeName: string,
        value: boolean,
        onTrial?: boolean,
    ) => void
    onSupportChange: (storeName: string, value: boolean) => void
    onSupportChatChange: (storeName: string, value: boolean) => void
    onSupportEmailChange: (storeName: string, value: boolean) => void
    onSaveClick: () => void
    onLearnMoreClick: () => void
    hasAiAgentNewActivationXp: boolean
}

export const AiAgentActivationModal = ({
    isOpen,
    isFetchLoading,
    isSaveLoading,
    onClose,
    progressPercentage,
    storeActivations,
    onSalesChange,
    onSupportChange,
    onSupportChatChange,
    onSupportEmailChange,
    onSaveClick,
    onLearnMoreClick,
    hasAiAgentNewActivationXp,
}: Props) => {
    const canUseAiSalesAgent = useCanUseAiSalesAgent()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const history = useHistory()
    const accountDomain = currentAccount.get('domain')
    const currentUser = useAppSelector(getCurrentUser)
    const userRole = useAppSelector(getRoleName)
    const atLeastOneStoreHasActiveTrial =
        atLeastOneStoreHasActiveTrialOnSpecificStores(storeActivations)

    const [isModalOpen, setIsModalOpen] = useState(false)

    const onSuccess = () => {
        onClose()
        setIsModalOpen(true)
    }

    const { routes, startTrial, isLoading, canStartTrial } =
        useActivateAiAgentTrial({
            accountDomain,
            storeActivations,
            onSuccess,
        })

    const eventData = useMemo(
        () => ({
            accountId: currentAccount.get('id'),
            userId: currentUser.get('id'),
            userRole: userRole || '',
            type: 'activation-modal',
            shopName:
                Object.values(storeActivations).length === 1
                    ? Object.values(storeActivations)[0].name
                    : '',
        }),
        [currentAccount, currentUser, userRole, storeActivations],
    )

    const handleBannerClick = () => {
        if (canStartTrial) {
            startTrial()
            logEvent(SegmentEvent.AiAgentShoppingAssistantStartTrialClicked, {
                ...eventData,
            })
        } else {
            onLearnMoreClick()
        }
    }

    useEffect(() => {
        if (
            !isFetchLoading &&
            !canUseAiSalesAgent &&
            !atLeastOneStoreHasActiveTrial &&
            !isLoading &&
            canStartTrial
        ) {
            logEvent(SegmentEvent.AiAgentShoppingAssistantTrialCtaDisplayed, {
                ...eventData,
            })
        }
    }, [
        eventData,
        isFetchLoading,
        canUseAiSalesAgent,
        atLeastOneStoreHasActiveTrial,
        isLoading,
        canStartTrial,
    ])

    const storeActivationList = Object.entries(storeActivations)

    return (
        <>
            <Modal
                preventCloseClickOutside
                className={css.modal}
                classNameContent={css.modalContent}
                classNameDialog={css.modalDialog}
                isOpen={isOpen}
                onClose={onClose}
            >
                {!hasAiAgentNewActivationXp && (
                    <div className={css.modalHeader}>
                        <div className={css.modalTitle}>
                            Manage AI Agent Activation
                        </div>
                        <div className={css.activationStatus}>
                            <ActivationProgress
                                percentage={progressPercentage}
                            />
                        </div>
                    </div>
                )}
                {hasAiAgentNewActivationXp && (
                    <div className={css.modalHeader}>
                        <div className={css.modalTitle}>Enable AI Agent</div>
                    </div>
                )}

                <ModalBody className={css.modalBody}>
                    {isFetchLoading ? (
                        <div className={css.loadingContainer}>
                            <LoadingSpinner size="big" />
                        </div>
                    ) : (
                        <>
                            {!canUseAiSalesAgent &&
                                !atLeastOneStoreHasActiveTrial && (
                                    <AiAgentSalesBanner
                                        className={css.banner}
                                        canStartTrial={canStartTrial}
                                        onClick={handleBannerClick}
                                        isLoading={isLoading}
                                    />
                                )}
                            <div className={css.storeCardsList}>
                                {storeActivationList.map(
                                    ([storeName, store]) => {
                                        return hasAiAgentNewActivationXp ? (
                                            <AiAgentActivationStoreCard
                                                key={storeName}
                                                isDisabled={isSaveLoading}
                                                store={store}
                                                onChatChange={(value) =>
                                                    onSupportChatChange(
                                                        storeName,
                                                        value,
                                                    )
                                                }
                                                onEmailChange={(value) =>
                                                    onSupportEmailChange(
                                                        storeName,
                                                        value,
                                                    )
                                                }
                                                closeModal={onClose}
                                            />
                                        ) : (
                                            <LegacyAiAgentActivationStoreCard
                                                key={storeName}
                                                isDisabled={isSaveLoading}
                                                store={store}
                                                onSalesChange={(value) =>
                                                    onSalesChange(
                                                        storeName,
                                                        value,
                                                        atLeastOneStoreHasActiveTrialOnSpecificStores(
                                                            {
                                                                [storeName]:
                                                                    store,
                                                            },
                                                        ),
                                                    )
                                                }
                                                onSupportChange={(value) =>
                                                    onSupportChange(
                                                        storeName,
                                                        value,
                                                    )
                                                }
                                                onSupportChatChange={(value) =>
                                                    onSupportChatChange(
                                                        storeName,
                                                        value,
                                                    )
                                                }
                                                onSupportEmailChange={(value) =>
                                                    onSupportEmailChange(
                                                        storeName,
                                                        value,
                                                    )
                                                }
                                                closeModal={onClose}
                                            />
                                        )
                                    },
                                )}
                            </div>
                        </>
                    )}
                </ModalBody>

                <div className={css.footer}>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSaveClick}
                        isLoading={isFetchLoading || isSaveLoading}
                    >
                        Save
                    </Button>
                </div>
            </Modal>
            <AIAgentTrialSuccessModal
                isOpen={isModalOpen}
                onClick={() => {
                    history.push(routes.customerEngagement)
                    setIsModalOpen(false)
                }}
                onClose={() => {
                    setIsModalOpen(false)
                }}
            />
        </>
    )
}
