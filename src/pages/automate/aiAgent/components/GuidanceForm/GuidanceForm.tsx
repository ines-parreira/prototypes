import React, {useState} from 'react'
import _isEqual from 'lodash/isEqual'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {notify} from 'state/notifications/actions'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import BackLink from 'pages/common/components/BackLink'
import history from 'pages/history'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import InputField from 'pages/common/forms/input/InputField'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import {FeatureFlagKey} from 'config/featureFlags'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {GuidanceEditor} from '../GuidanceEditor/GuidanceEditor'

import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import {GuidanceFormFields} from '../../types'
import css from './GuidanceForm.less'

const FORM_INITIAL_STATE = {
    name: '',
    content: '',
    isVisible: true,
}

type Props = {
    shopName: string
    isLoading: boolean
    actionType: 'update' | 'create'
    onSubmit: (fields: GuidanceFormFields) => Promise<void>
    onDelete?: () => Promise<void>
    initialFields?: GuidanceFormFields
}

export const GuidanceForm = ({
    shopName,
    isLoading,
    onSubmit,
    initialFields,
    onDelete,
    actionType,
}: Props) => {
    const isGuidanceToggleEnabled: undefined | boolean =
        useFlags()[FeatureFlagKey.AiAgentGuidanceToggle]
    const dispatch = useAppDispatch()
    const {routes} = useAiAgentNavigation({shopName})
    const initialFormState = initialFields ?? FORM_INITIAL_STATE
    const [formState, setFormState] =
        useState<GuidanceFormFields>(initialFormState)
    const onNameChange = (value: string) => {
        setFormState((prevState) => ({...prevState, name: value}))
    }

    const onContentChange = (value: string) => {
        setFormState((prevState) => ({...prevState, content: value}))
    }

    const onChangeVisibility = (isVisible: boolean) => {
        setFormState((prevState) => ({...prevState, isVisible}))
    }

    const isFormDirty = !_isEqual(initialFormState, formState)

    const isSubmitDisabled =
        !formState.name ||
        !formState.content ||
        (actionType === 'update' && !isFormDirty)

    const handleDelete = async () => {
        if (!onDelete) return

        try {
            await onDelete()
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Guidance successfully deleted',
                })
            )
            history.push(routes.guidance)
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article deletion.',
                })
            )
        }
    }

    const onCancel = () => {
        history.push(routes.guidance)
    }

    const resetForm = () => {
        setFormState(initialFormState)
    }

    const handleSubmit = async ({redirectTo}: {redirectTo: string}) => {
        try {
            await onSubmit(formState)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Guidance successfully saved',
                })
            )

            history.push(redirectTo)
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Error during guidance article ${actionType}.`,
                })
            )
        }
    }

    const onSave = async () => {
        await handleSubmit({redirectTo: routes.guidance})
    }

    const onSaveAndTest = async () => {
        await handleSubmit({redirectTo: routes.test})
    }

    return (
        <>
            <UnsavedChangesPrompt
                onSave={onSave}
                when={isFormDirty && !isLoading}
                onDiscard={resetForm}
                shouldRedirectAfterSave={true}
            />

            <div>
                <div className={css.content}>
                    <BackLink path={routes.guidance} label="Back to Guidance" />

                    <InputField
                        label="Guidance name"
                        isRequired
                        placeholder="e.g. Order questions without data"
                        caption="AI Agent uses this to help find relevant guidance"
                        onChange={onNameChange}
                        name="name"
                        value={formState.name}
                        maxLength={135}
                    />
                    <GuidanceEditor
                        onChange={onContentChange}
                        label="Instructions"
                        value={formState.content}
                        placeholder="e.g. If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address."
                        maxChars={5000}
                        height={320}
                    />

                    {isGuidanceToggleEnabled && (
                        <ToggleInput
                            isToggled={formState.isVisible}
                            onClick={(val) => {
                                void onChangeVisibility(val)
                            }}
                        >
                            Available for AI Agent
                        </ToggleInput>
                    )}
                </div>

                <div className={css.btnGroup}>
                    <Button
                        isDisabled={isSubmitDisabled}
                        disabled={isSubmitDisabled}
                        isLoading={isLoading}
                        onClick={onSave}
                    >
                        {actionType === 'update'
                            ? 'Save Changes'
                            : 'Create Guidance'}
                    </Button>
                    <Button
                        intent="secondary"
                        isDisabled={isSubmitDisabled}
                        disabled={isSubmitDisabled}
                        isLoading={isLoading}
                        onClick={onSaveAndTest}
                    >
                        {actionType === 'update'
                            ? 'Save And Test'
                            : 'Create And Test'}
                    </Button>

                    <Button intent="secondary" onClick={onCancel}>
                        Cancel
                    </Button>

                    {onDelete && (
                        <div className={css.additionalActions}>
                            <ConfirmButton
                                fillStyle="ghost"
                                intent="destructive"
                                confirmLabel="Delete"
                                confirmationButtonIntent="destructive"
                                confirmationTitle="Delete Guidance?"
                                onConfirm={handleDelete}
                                confirmationContent={
                                    <p>
                                        Are you sure you want to delete{' '}
                                        <b>{formState.name}</b> Guidance?
                                    </p>
                                }
                            >
                                Delete Guidance
                            </ConfirmButton>
                        </div>
                    )}
                </div>
            </div>

            <div className={css.alertContainer}>
                <Alert type={AlertType.Info} icon className={css.alert}>
                    <p>
                        Give your AI Agent instructions on how to handle
                        specific situations.
                    </p>
                    <p>
                        Instructions can be context specific, for example:{' '}
                        <b>
                            “For pricing questions, you will point customers to
                            our pricing page: https://example.com/pricing”
                        </b>
                    </p>
                </Alert>
            </div>
        </>
    )
}
