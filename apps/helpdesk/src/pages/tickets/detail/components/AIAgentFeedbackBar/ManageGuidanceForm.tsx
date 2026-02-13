import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'

import {
    LegacyButton as Button,
    LegacyIconButton as IconButton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { HelpCenter } from 'models/helpCenter/types'
import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { GUIDANCE_EDITOR_DEFAULT_LABEL } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceArticle, GuidanceFormFields } from 'pages/aiAgent/types'
import {
    handleGuidanceDuplicateError,
    mapGuidanceFormFieldsToGuidanceArticle,
} from 'pages/aiAgent/utils/guidance.utils'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { Drawer } from 'pages/common/components/Drawer'
import UnsavedChangesModal from 'pages/common/components/UnsavedChangesModal'
import InputField from 'pages/common/forms/input/InputField'
import { AddMissingKnowledgeCheckbox } from 'pages/tickets/detail/components/AIAgentFeedbackBar/AddMissingKnowledgeCheckbox'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import type { SuggestedResourceValue } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { onApiError } from 'state/utils'

import { getGuidanceUrl, getHelpcenterIdAsString } from './utils'

import css from './ManageGuidanceForm.less'

const FORM_ACTION_TYPE = {
    CREATE: 'create',
    UPDATE: 'update',
}

interface ManageGuidanceFormFields extends GuidanceFormFields {
    shouldAddToMissingKnowledge: boolean
}

const FORM_INITIAL_STATE: ManageGuidanceFormFields = {
    name: '',
    content: '',
    isVisible: true,
    shouldAddToMissingKnowledge: true,
}

type ManageGuidanceFormProps = {
    shopName: string
    shopType: string
    url?: string
    helpCenter: HelpCenter
    guidance?: GuidanceArticle
    onSubmitNewMissingKnowledge: (resource: SuggestedResourceValue) => void
    onSaveClick: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
        isNew: boolean,
    ) => void
}

export const ManageGuidanceForm = ({
    shopName,
    shopType,
    url,
    helpCenter,
    guidance,
    onSubmitNewMissingKnowledge,
    onSaveClick,
}: ManageGuidanceFormProps) => {
    const areActionsInGuidanceEnabled = useFlag<boolean>(
        FeatureFlagKey.AiAgentSupportActionInGuidance,
        false,
    )
    const { closeModal, openEdit } = useKnowledgeSourceSideBar()
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
                      shouldAddToMissingKnowledge: false,
                  }
                : FORM_INITIAL_STATE,
        [guidance],
    )

    const dispatch = useAppDispatch()

    const [formState, setFormState] =
        useState<ManageGuidanceFormFields>(initialFormState)

    const onNameChange = useCallback((value: string) => {
        setFormState((prevState) => ({ ...prevState, name: value }))
    }, [])

    const onContentChange = useCallback((value: string) => {
        setFormState((prevState) => ({ ...prevState, content: value }))
    }, [])

    const onShouldAddToMissingKnowledgeChange = useCallback(
        (checked: boolean) => {
            setFormState((prevState) => ({
                ...prevState,
                shouldAddToMissingKnowledge: checked,
            }))
        },
        [],
    )

    const isFormDirty = useMemo(() => {
        // we don't include checkbox as a change that would block modal closing
        const isDirty = !_isEqual(
            _omit(initialFormState, 'shouldAddToMissingKnowledge'),
            _omit(formState, 'shouldAddToMissingKnowledge'),
        )
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

    const handleOnSubmitNewMissingKnowledge = useCallback(
        (articleId: string) => {
            onSubmitNewMissingKnowledge({
                resourceId: articleId,
                resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                resourceSetId: helpCenter.id.toString(),
                resourceLocale: helpCenter.default_locale,
            })
        },
        [helpCenter.default_locale, helpCenter.id, onSubmitNewMissingKnowledge],
    )

    const onSubmit = useCallback(
        async (
            guidanceFormFields: ManageGuidanceFormFields,
            keepOpenForEditing: boolean,
        ) => {
            const locale = helpCenter.default_locale
            const helpCenterId = getHelpcenterIdAsString(helpCenter.id)

            if (guidance) {
                await updateGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                    ),
                    { articleId: guidance.id, locale },
                )

                if (guidanceFormFields.shouldAddToMissingKnowledge) {
                    handleOnSubmitNewMissingKnowledge(guidance.id.toString())
                }

                onSaveClick(
                    guidance.id.toString(),
                    AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                    helpCenterId,
                    false,
                )
            } else {
                const createdArticle = await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                    ),
                )

                if (createdArticle) {
                    const articleId = createdArticle.id.toString()

                    if (guidanceFormFields.shouldAddToMissingKnowledge) {
                        handleOnSubmitNewMissingKnowledge(articleId)
                    }

                    onSaveClick(
                        articleId,
                        AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                        helpCenterId,
                        true,
                    )

                    if (keepOpenForEditing) {
                        const formattedNewSelectedResource = {
                            id: articleId,
                            content: createdArticle.translation.content,
                            title: createdArticle.translation.title,
                            url: getGuidanceUrl(
                                {
                                    id: Number(createdArticle.id),
                                    name: createdArticle.translation.title,
                                },
                                '',
                                shopName,
                            ),
                            knowledgeResourceType:
                                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                            helpCenterId: helpCenter.id.toString(),
                        }

                        openEdit(formattedNewSelectedResource)
                    }
                }
            }
        },
        [
            openEdit,
            guidance,
            createGuidanceArticle,
            updateGuidanceArticle,
            helpCenter.default_locale,
            handleOnSubmitNewMissingKnowledge,
            shopName,
            helpCenter.id,
            onSaveClick,
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

    const handleSubmit = useCallback(
        async (keepOpenForEditing: boolean = true) => {
            try {
                await onSubmit(formState, keepOpenForEditing)
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
        },
        [
            onSubmit,
            formState,
            actionType,
            guidanceArticles.length,
            dispatch,
            handleOnTriggerActivateAiAgentNotification,
        ],
    )

    const guardUnsavedChanges = useCallback(() => {
        if (isFormDirty) {
            openUnsavedChangesModal()
            return
        }

        closeModal()
    }, [isFormDirty, openUnsavedChangesModal, closeModal])

    const handleUnsavedChangesModalDiscard = useCallback(() => {
        resetForm()
        closeUnsavedChangesModal()
        closeModal()
    }, [resetForm, closeUnsavedChangesModal, closeModal])

    const handleUnsavedChangesModalClose = useCallback(() => {
        closeUnsavedChangesModal()
    }, [closeUnsavedChangesModal])

    const handleUnsavedChangesModalSave = useCallback(async () => {
        closeUnsavedChangesModal()
        await handleSubmit(false)
        closeModal()
    }, [closeUnsavedChangesModal, handleSubmit, closeModal])

    return (
        <>
            <UnsavedChangesModal
                onDiscard={handleUnsavedChangesModalDiscard}
                isOpen={isOpen}
                onClose={handleUnsavedChangesModalClose}
                onSave={handleUnsavedChangesModalSave}
            />

            <Drawer.Header className={css.header}>
                Guidance
                <Drawer.HeaderActions
                    onClose={guardUnsavedChanges}
                    closeButtonId="close-button"
                >
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <IconButton
                                id="open-guidance-in-new-tab"
                                icon="open_in_new"
                                fillStyle="ghost"
                                intent="secondary"
                                size="medium"
                                aria-label="open resource management in new tab"
                            />
                            <Tooltip
                                target="open-guidance-in-new-tab"
                                placement="bottom"
                            >
                                Open in new tab
                            </Tooltip>
                        </a>
                    )}
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content className={css.guidanceEditorContainer}>
                <InputField
                    label="Guidance name"
                    isRequired
                    caption={
                        <>
                            Use a short, scenario-based name. Example:{' '}
                            <em>Returns outside the policy window</em>
                        </>
                    }
                    onChange={onNameChange}
                    name="name"
                    value={formState.name}
                    maxLength={135}
                />
                <div className={css.editorContainer}>
                    <GuidanceEditor
                        content={formState.content}
                        handleUpdateContent={onContentChange}
                        label={GUIDANCE_EDITOR_DEFAULT_LABEL}
                        shopName={shopName}
                        availableActions={guidanceActions}
                        showActionsButton={areActionsInGuidanceEnabled}
                    />
                </div>
            </Drawer.Content>
            <Drawer.Footer className={css.footer}>
                <Button
                    isDisabled={isSubmitDisabled}
                    onClick={() => handleSubmit(true)}
                >
                    {actionType === FORM_ACTION_TYPE.UPDATE
                        ? 'Save Changes'
                        : 'Create Guidance'}
                </Button>

                <Button intent="secondary" onClick={guardUnsavedChanges}>
                    Cancel
                </Button>
                {actionType === FORM_ACTION_TYPE.CREATE && (
                    <AddMissingKnowledgeCheckbox
                        isChecked={formState.shouldAddToMissingKnowledge}
                        onChange={onShouldAddToMissingKnowledgeChange}
                    />
                )}
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
                        // Render popover at document body level to escape drawer's stacking context
                        containerElement={document.body}
                    >
                        Delete Guidance
                    </ConfirmButton>
                )}
            </Drawer.Footer>
        </>
    )
}
