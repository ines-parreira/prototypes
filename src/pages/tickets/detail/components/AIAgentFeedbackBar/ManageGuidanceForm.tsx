import { useCallback, useEffect, useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'

import { Button, IconButton } from '@gorgias/merchant-ui-kit'

import Caption from 'gorgias-design-system/Input/Caption'
import useAppDispatch from 'hooks/useAppDispatch'
import { HelpCenter, LocalArticleTranslation } from 'models/helpCenter/types'
import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { GUIDANCE_EDITOR_DEFAULT_LABEL } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { GuidanceArticle, GuidanceFormFields } from 'pages/aiAgent/types'
import {
    handleGuidanceDuplicateError,
    mapGuidanceFormFieldsToGuidanceArticle,
} from 'pages/aiAgent/utils/guidance.utils'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { Drawer } from 'pages/common/components/Drawer'
import UnsavedChangesModal from 'pages/common/components/UnsavedChangesModal'
import InputField from 'pages/common/forms/input/InputField'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar.less'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'
import { getGuidanceUrl } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { onApiError } from 'state/utils'

const FORM_ACTION_TYPE = {
    CREATE: 'create',
    UPDATE: 'update',
}

const FORM_INITIAL_STATE = {
    name: '',
    content: '',
    isVisible: true,
}

type ManageGuidanceFormProps = {
    shopName: string
    shopType: string
    url?: string
    helpCenter: HelpCenter
    guidance?: GuidanceArticle
}

export const ManageGuidanceForm = ({
    shopName,
    shopType,
    url,
    helpCenter,
    guidance,
}: ManageGuidanceFormProps) => {
    const { openPreview, closeModal, selectedResource } =
        useKnowledgeSourceSideBar()
    const {
        isOpen,
        openUnsavedChangesModal,
        closeUnsavedChangesModal,
        setHasUnsavedChangesRef,
    } = useUnsavedChangesModal()

    const actionType = guidance
        ? FORM_ACTION_TYPE.UPDATE
        : FORM_ACTION_TYPE.CREATE

    const initialFormState = useMemo(
        () =>
            guidance
                ? {
                      name: guidance.title,
                      content: guidance.content,
                      isVisible: guidance.visibility === 'PUBLIC',
                  }
                : FORM_INITIAL_STATE,
        [guidance],
    )

    const dispatch = useAppDispatch()

    const [formState, setFormState] =
        useState<GuidanceFormFields>(initialFormState)

    const onNameChange = useCallback((value: string) => {
        setFormState((prevState) => ({ ...prevState, name: value }))
    }, [])

    const onContentChange = useCallback((value: string) => {
        setFormState((prevState) => ({ ...prevState, content: value }))
    }, [])

    const isFormDirty = useMemo(() => {
        const isDirty = !_isEqual(initialFormState, formState)
        return isDirty
    }, [initialFormState, formState])

    useEffect(() => {
        setHasUnsavedChangesRef(isFormDirty)
        return () => setHasUnsavedChangesRef(false)
    }, [isFormDirty, setHasUnsavedChangesRef])

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const {
        guidanceArticles,
        isLoadingAiGuidances,
        isLoadingGuidanceArticleList,
    } = useGuidanceAiSuggestions({
        helpCenterId: helpCenter.id,
        shopName,
    })

    const {
        updateGuidanceArticle,
        deleteGuidanceArticle,
        createGuidanceArticle,
        isGuidanceArticleUpdating,
        isGuidanceArticleDeleting,
    } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenter.id,
    })

    const {
        isLoading: isLoadingOnboardingNotificationState,
        handleOnTriggerActivateAiAgentNotification,
    } = useAiAgentOnboardingNotification({ shopName })

    const onSubmit = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            const locale = helpCenter.default_locale

            let newGuidance: LocalArticleTranslation | undefined

            if (guidance) {
                newGuidance = await updateGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                    ),
                    { articleId: guidance.id, locale },
                )
            } else {
                const article = await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                    ),
                )

                newGuidance = article?.translation
            }

            const formattedNewSelectedResource = {
                id: newGuidance?.article_id.toString() ?? '',
                content: newGuidance?.content ?? '',
                title: newGuidance?.title ?? '',
                url: getGuidanceUrl(
                    {
                        id: Number(newGuidance?.article_id),
                        name: newGuidance?.title ?? '',
                    },
                    '',
                    shopName,
                ),
                knowledgeResourceType:
                    AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                helpCenterId: helpCenter.id.toString(),
            }

            const newSelectedResource = {
                ...selectedResource,
                ...formattedNewSelectedResource,
            }

            openPreview(newSelectedResource)
        },
        [
            openPreview,
            selectedResource,
            guidance,
            createGuidanceArticle,
            updateGuidanceArticle,
            helpCenter.default_locale,
            helpCenter.id,
            shopName,
        ],
    )

    const isSubmitDisabled =
        isLoadingAiGuidances ||
        isLoadingActions ||
        isGuidanceArticleDeleting ||
        isGuidanceArticleUpdating ||
        isLoadingGuidanceArticleList ||
        isLoadingOnboardingNotificationState ||
        !formState.name ||
        !formState.content ||
        (actionType === FORM_ACTION_TYPE.UPDATE && !isFormDirty)

    const handleDelete = useCallback(
        async (id: number) => {
            try {
                await deleteGuidanceArticle(id)
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Guidance successfully deleted',
                    }),
                )

                closeModal()
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Error during guidance article deletion.',
                    }),
                )
            }
        },
        [deleteGuidanceArticle, dispatch, closeModal],
    )

    const resetForm = useCallback(() => {
        setFormState(initialFormState)
    }, [initialFormState])

    const handleSubmit = useCallback(async () => {
        try {
            await onSubmit(formState)
            const notificationMessage =
                actionType === FORM_ACTION_TYPE.UPDATE
                    ? 'Guidance successfully saved'
                    : 'Guidance successfully created'
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: notificationMessage,
                }),
            )

            if (guidanceArticles.length >= 2) {
                handleOnTriggerActivateAiAgentNotification()
            }
        } catch (error) {
            const duplicateErrorResult = handleGuidanceDuplicateError(
                error,
                formState.name,
            )

            if (duplicateErrorResult.isDuplicate) {
                void dispatch(notify(duplicateErrorResult.notification))
                return
            }

            void dispatch(
                onApiError(
                    error,
                    `Error during guidance article ${actionType}.`,
                ),
            )
        }
    }, [
        onSubmit,
        formState,
        actionType,
        guidanceArticles.length,
        dispatch,
        handleOnTriggerActivateAiAgentNotification,
    ])

    const guardUnsavedChanges = useCallback(
        (callback: () => void) => {
            if (isFormDirty) {
                openUnsavedChangesModal()
                return
            }

            callback()
        },
        [isFormDirty, openUnsavedChangesModal],
    )

    const handleUnsavedChangesModalDiscard = useCallback(() => {
        resetForm()
        closeUnsavedChangesModal()
        closeModal()
    }, [resetForm, closeUnsavedChangesModal, closeModal])

    const handleUnsavedChangesModalClose = useCallback(() => {
        closeUnsavedChangesModal()
    }, [closeUnsavedChangesModal])

    const handleUnsavedChangesModalSave = useCallback(() => {
        closeUnsavedChangesModal()
        handleSubmit()
    }, [closeUnsavedChangesModal, handleSubmit])

    return (
        <>
            <UnsavedChangesModal
                onDiscard={handleUnsavedChangesModalDiscard}
                isOpen={isOpen}
                onClose={handleUnsavedChangesModalClose}
                onSave={handleUnsavedChangesModalSave}
            />

            <Drawer.Header>
                Guidance
                <Drawer.HeaderActions
                    onClose={() =>
                        guardUnsavedChanges(() =>
                            actionType === FORM_ACTION_TYPE.UPDATE
                                ? openPreview(selectedResource!)
                                : closeModal(),
                        )
                    }
                    closeButtonId="close-button"
                >
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <IconButton
                                icon="open_in_new"
                                fillStyle="ghost"
                                intent="secondary"
                                size="medium"
                                aria-label="open resource management in new tab"
                            />
                        </a>
                    )}
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content className={css.guidanceEditorContainer}>
                <InputField
                    label="Guidance name"
                    isRequired
                    caption="Provide a name for this Guidance. e.g. When a customer asks for a return or exchange"
                    onChange={onNameChange}
                    name="name"
                    value={formState.name}
                    maxLength={135}
                />
                <div>
                    <GuidanceEditor
                        content={formState.content}
                        handleUpdateContent={onContentChange}
                        label={GUIDANCE_EDITOR_DEFAULT_LABEL}
                        shopName={shopName}
                        availableActions={guidanceActions}
                    />
                    <Caption isValid>
                        Provide instructions on how AI Agent should handle this
                        situation.
                    </Caption>
                </div>
            </Drawer.Content>
            <Drawer.Footer className={css.footer}>
                <Button isDisabled={isSubmitDisabled} onClick={handleSubmit}>
                    {actionType === FORM_ACTION_TYPE.UPDATE
                        ? 'Save Changes'
                        : 'Create Guidance'}
                </Button>

                <Button
                    intent="secondary"
                    onClick={() => guardUnsavedChanges(closeModal)}
                >
                    Cancel
                </Button>

                {guidance && (
                    <ConfirmButton
                        className={css.deleteButton}
                        fillStyle="ghost"
                        intent="destructive"
                        confirmLabel="Delete"
                        confirmationButtonIntent="destructive"
                        confirmationTitle="Delete Guidance?"
                        onConfirm={() => handleDelete(guidance.id)}
                        confirmationContent={
                            <p>
                                Are you sure you want to delete{' '}
                                <b>{formState.name}</b> Guidance?
                            </p>
                        }
                    >
                        Delete Guidance
                    </ConfirmButton>
                )}
            </Drawer.Footer>
        </>
    )
}
