import { useEffect, useState } from 'react'

import _noop from 'lodash/noop'
import { useParams } from 'react-router-dom'

import { Text } from '@gorgias/axiom'

import { StepConfiguration } from 'models/aiAgentPostStoreInstallationSteps/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { DeleteModal } from '../AiAgentTasks/DeleteModal'
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
}

export const TrainSection = ({ stepMetadata, step, updateStep }: Props) => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const [isGuidanceTemplatesModalOpen, setIsGuidanceTemplatesModalOpen] =
        useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    // oxlint-disable-next-line no-unused-vars
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
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
        if (isLoadingGuidanceArticles || Boolean(step.stepCompletedDatetime))
            return

        if (guidanceArticles.length >= MAX_VISIBLE_GUIDANCES_TRAIN_SECTION)
            updateStep({
                ...step,
                stepCompletedDatetime: new Date().toISOString(),
            })
    }, [step, updateStep, isLoadingGuidanceArticles, guidanceArticles])

    const onDelete = async () => {
        if (!guidanceArticleId) return
        await deleteGuidanceArticle(guidanceArticleId)
        setIsDeleteModalOpen(false)
        setGuidanceArticleId(null)
    }

    // oxlint-disable-next-line no-unused-vars
    const onEdit = (guidanceArticleId: number) => {
        //do nothing for now
    }

    const onCloseGuidanceTemplatesModal = () => {
        setIsGuidanceTemplatesModalOpen(false)
    }

    const handleOnDeleteIconClick = (guidanceArticleId: number) => {
        setGuidanceArticleId(guidanceArticleId)
        setIsDeleteModalOpen(true)
    }

    const handleOnEditIconClick = (guidanceArticleId: number) => {
        setGuidanceArticleId(guidanceArticleId)
        setIsEditModalOpen(true)
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
                    />
                    <GuidanceList
                        guidanceArticles={guidanceArticles}
                        isLoading={isLoadingGuidanceArticles}
                        shopName={shopName}
                        onDelete={handleOnDeleteIconClick}
                        onEdit={handleOnEditIconClick}
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
                onTemplateClick={_noop}
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
        </>
    )
}
