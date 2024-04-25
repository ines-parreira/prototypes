import React, {useState} from 'react'
import _isEqual from 'lodash/isEqual'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import BackLink from 'pages/common/components/BackLink'
import history from 'pages/history'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import InputField from 'pages/common/forms/input/InputField'
import {GuidanceEditor} from '../GuidanceEditor/GuidanceEditor'

import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import css from './GuidanceForm.less'

export type GuidanceFormFields = {
    name: string
    content: string
}

type Props = {
    shopName: string
    isLoading: boolean
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
}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})
    const [formState, setFormState] = useState<GuidanceFormFields>(
        initialFields ?? {name: '', content: ''}
    )
    const onNameChange = (value: string) => {
        setFormState((prevState) => ({...prevState, name: value}))
    }

    const onContentChange = (value: string) => {
        setFormState((prevState) => ({...prevState, content: value}))
    }

    const isSubmitDisabled =
        !formState.name ||
        !formState.content ||
        (initialFields && _isEqual(initialFields, formState))

    const handleDelete = async () => {
        if (!onDelete) return

        await onDelete()

        history.push(routes.guidance)
    }

    const onCancel = () => {
        history.push(routes.guidance)
    }

    const handleSubmit = async () => {
        await onSubmit(formState)

        history.push(routes.guidance)
    }

    const onSaveAndTest = async () => {
        await onSubmit(formState)

        history.push(routes.playground)
    }

    return (
        <>
            <div className={css.container}>
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
                    />
                    <GuidanceEditor
                        onChange={onContentChange}
                        label="Instructions"
                        value={formState.content}
                        placeholder="e.g. If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address."
                        maxChars={1000}
                        height={320}
                    />
                </div>

                <div className={css.btnGroup}>
                    <Button
                        isDisabled={isSubmitDisabled}
                        disabled={isSubmitDisabled}
                        isLoading={isLoading}
                        onClick={handleSubmit}
                    >
                        {initialFields ? 'Save Changes' : 'Create Guidance'}
                    </Button>
                    <Button
                        isDisabled={isSubmitDisabled}
                        disabled={isSubmitDisabled}
                        isLoading={isLoading}
                        onClick={onSaveAndTest}
                    >
                        {initialFields ? 'Save And Test' : 'Create And Test'}
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
                            “For pricing questions, point them to our pricing
                            page: https://example.com/pricing”
                        </b>
                    </p>
                    <p>
                        Instructions can also be general:{' '}
                        <b>
                            “Always end by asking if they need more help, no
                            matter what they asked.”
                        </b>
                    </p>
                </Alert>
            </div>
        </>
    )
}
