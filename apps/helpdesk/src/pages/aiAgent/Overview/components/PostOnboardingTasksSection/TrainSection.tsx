import { useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { Text } from '@gorgias/axiom'

import {
    PostStoreInstallationStepStatus,
    StepConfiguration,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { GuidanceTemplate } from 'pages/aiAgent/types'

import { DeleteModal } from '../AiAgentTasks/DeleteModal'
import { SuccessModal } from '../AiAgentTasks/SuccessModal'
import { GuidanceList } from './GuidanceList'
import { GuidanceTemplatesModal } from './GuidanceTemplatesModal'
import { TrainButton } from './TrainButton'
import { PostOnboardingStepMetadata } from './types'
import { MAX_VISIBLE_GUIDANCES_TRAIN_SECTION } from './utils'

import css from './TrainSection.less'

type Props = {
    stepMetadata: PostOnboardingStepMetadata
    step: StepConfiguration
    updateStep: (step: StepConfiguration) => void
    onEditGuidance: (guidanceId: number) => void
    onCreateGuidance: (template?: GuidanceTemplate) => void
    isEditorOpen: boolean
}

export const TrainSection = ({
    stepMetadata,
    step,
    updateStep,
    onEditGuidance,
    onCreateGuidance,
    isEditorOpen,
}: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const [isGuidanceTemplatesModalOpen, setIsGuidanceTemplatesModalOpen] =
        useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [showFirstGuidanceModal, setShowFirstGuidanceModal] = useState(false)
    const [showTrainCompleteModal, setShowTrainCompleteModal] = useState(false)
    const [firstGuidanceCreated, setFirstGuidanceCreated] = useState(true)

    const [guidanceArticleId, setGuidanceArticleId] = useState<number | null>(
        null,
    )
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const {
        guidanceArticles,
        isGuidanceArticleListLoading: isLoadingGuidanceArticles,
    } = useGuidanceArticles(storeConfiguration?.guidanceHelpCenterId ?? 0, {
        enabled: !!storeConfiguration?.guidanceHelpCenterId,
    })

    const { deleteGuidanceArticle, isGuidanceArticleDeleting } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: storeConfiguration?.guidanceHelpCenterId ?? 0,
        })

    useEffect(() => {
        if (isLoadingGuidanceArticles || isEditorOpen) return

        const guidanceCount = guidanceArticles.length

        if (guidanceCount === 1 && !firstGuidanceCreated && !isEditorOpen) {
            setShowFirstGuidanceModal(true)
        }

        if (
            guidanceCount >= MAX_VISIBLE_GUIDANCES_TRAIN_SECTION &&
            !Boolean(step.stepCompletedDatetime)
        ) {
            setShowTrainCompleteModal(true)
            updateStep({
                ...step,
                stepCompletedDatetime: new Date().toISOString(),
            })

            logEvent(SegmentEvent.PostOnboardingTaskCompleted, {
                step: stepMetadata.stepName,
                status: PostStoreInstallationStepStatus.COMPLETED,
                shop_name: shopName,
                shop_type: shopType,
            })
        }
    }, [
        isLoadingGuidanceArticles,
        guidanceArticles.length,
        step,
        updateStep,
        shopName,
        shopType,
        stepMetadata.stepName,
        isEditorOpen,
        firstGuidanceCreated,
    ])

    const onDelete = async () => {
        if (!guidanceArticleId) return
        await deleteGuidanceArticle(guidanceArticleId)
        setIsDeleteModalOpen(false)
        setGuidanceArticleId(null)
    }

    const onCloseGuidanceTemplatesModal = () => {
        setIsGuidanceTemplatesModalOpen(false)
    }

    const handleOnDeleteIconClick = (guidanceArticleId: number) => {
        setGuidanceArticleId(guidanceArticleId)
        setIsDeleteModalOpen(true)
    }

    const onCreateGuidanceClick = (template?: GuidanceTemplate) => {
        if (guidanceArticles.length === 0) {
            setFirstGuidanceCreated(false)
        }
        setIsGuidanceTemplatesModalOpen(false)
        onCreateGuidance(template)
    }

    return (
        <>
            <div className={css.container}>
                <div className={css.leftContent}>
                    <Text size="md" variant="regular">
                        <span
                            className={css.stepDescription}
                            dangerouslySetInnerHTML={{
                                __html: stepMetadata.stepDescription as string,
                            }}
                        />
                    </Text>

                    <TrainButton
                        isLoadingGuidanceArticles={isLoadingGuidanceArticles}
                        guidanceArticlesLength={guidanceArticles.length}
                        setIsGuidanceTemplatesModalOpen={
                            setIsGuidanceTemplatesModalOpen
                        }
                        onCustomGuidanceClick={onCreateGuidanceClick}
                    />
                    <GuidanceList
                        guidanceArticles={guidanceArticles}
                        isLoading={isLoadingGuidanceArticles}
                        shopName={shopName}
                        onDelete={handleOnDeleteIconClick}
                        onEdit={(guidanceId) => onEditGuidance(guidanceId)}
                    />
                </div>

                <div className={css.rightContent}>
                    <img
                        src={stepMetadata.stepImage}
                        alt="AI Agent training"
                        className={css.image}
                    />
                </div>
            </div>

            <GuidanceTemplatesModal
                isOpen={isGuidanceTemplatesModalOpen}
                onClose={onCloseGuidanceTemplatesModal}
                onTemplateClick={onCreateGuidanceClick}
            />

            <DeleteModal
                title="Delete guidance?"
                description="You’re about to delete this guidance. You cannot undo
                        this action, and the content of your guidance will be
                        lost."
                isDeleting={isGuidanceArticleDeleting}
                isModalOpen={isDeleteModalOpen}
                onDelete={onDelete}
                setModalOpen={setIsDeleteModalOpen}
            />

            <SuccessModal
                isOpen={showFirstGuidanceModal}
                title="You've created your first Guidance!"
                description="You're one step closer to going live with your AI Agent. Just 4 more to go to make sure it's prepared to start responding to customer conversations."
                actionLabel="Keep going"
                handleOnClose={() => {
                    setShowFirstGuidanceModal(false)
                    setFirstGuidanceCreated(true)
                }}
            />

            <SuccessModal
                isOpen={showTrainCompleteModal}
                title="Guidance setup complete!"
                description={
                    <>
                        Your AI Agent now has enough training to start helping
                        your customers. You can{' '}
                        <span className={css.highlight}>
                            create more Guidance anytime{' '}
                        </span>
                        to expand its knowledge and improve accuracy
                    </>
                }
                actionLabel="Got it"
                handleOnClose={() => setShowTrainCompleteModal(false)}
            />
        </>
    )
}
