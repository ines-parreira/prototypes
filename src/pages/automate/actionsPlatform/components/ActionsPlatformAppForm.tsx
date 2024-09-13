import React from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useHistory} from 'react-router-dom'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {IntegrationType} from 'models/integration/constants'

import {ActionsApp, App} from '../types'
import ActionsPlatformAppSelectBox from './ActionsPlatformAppSelectBox'
import ActionsPlatformAuthTypeSelectBox from './ActionsPlatformAuthTypeSelectBox'

import css from './ActionsPlatformAppForm.less'

type Props = {
    value?: ActionsApp
    apps: Extract<App, {type: IntegrationType.App}>[]
    onSubmit: (value: ActionsApp) => void
    isSubmitting?: boolean
}

const ActionsPlatformAppForm = ({
    value,
    apps,
    onSubmit,
    isSubmitting,
}: Props) => {
    const history = useHistory()

    const {control, reset, getValues, formState} = useForm<ActionsApp>({
        defaultValues: {auth_type: 'api-key'},
        values: value,
    })

    const isNewActionsApp = !value

    const renderAuthSettings = () => {
        switch (getValues('auth_type')) {
            case 'api-key':
                return (
                    <Controller
                        control={control}
                        name="auth_settings.url"
                        rules={{
                            required: true,
                            validate: (value) => {
                                if (!value) {
                                    return false
                                }

                                try {
                                    new URL(value)

                                    return true
                                } catch {
                                    return false
                                }
                            },
                        }}
                        render={({field: {value, onChange}}) => (
                            <InputField
                                isRequired
                                label="Instructions URL"
                                value={value ?? ''}
                                onChange={onChange}
                                caption="URL with instructions on how to find an API key."
                                placeholder="https://link.gorgias.com/xyz"
                            />
                        )}
                    />
                )
        }
    }

    return (
        <>
            <Button
                fillStyle="ghost"
                intent="secondary"
                onClick={() => {
                    history.push('/app/automation/actions-platform/apps')
                }}
                className={css.backButton}
            >
                <ButtonIconLabel icon="arrow_back">
                    Back to Apps
                </ButtonIconLabel>
            </Button>
            <div className={css.section}>
                <Controller
                    control={control}
                    name="id"
                    rules={{
                        required: true,
                    }}
                    render={({field: {value, onChange}}) => (
                        <ActionsPlatformAppSelectBox
                            value={value}
                            onChange={onChange}
                            isDisabled={!isNewActionsApp}
                            apps={apps}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="auth_type"
                    rules={{
                        required: true,
                    }}
                    render={({field: {value, onChange}}) => (
                        <ActionsPlatformAuthTypeSelectBox
                            value={value}
                            onChange={onChange}
                            isDisabled={!isNewActionsApp}
                        />
                    )}
                />
                {renderAuthSettings()}
            </div>
            <div className={css.actions}>
                <Button
                    isDisabled={
                        !formState.isValid || !formState.isDirty || isSubmitting
                    }
                    onClick={() => {
                        onSubmit(getValues())
                    }}
                >
                    {isNewActionsApp ? 'Create App settings' : 'Save Changes'}
                </Button>
                <Button
                    intent="secondary"
                    isDisabled={!formState.isDirty || isSubmitting}
                    onClick={() => {
                        reset()
                    }}
                >
                    Cancel
                </Button>
            </div>
            <UnsavedChangesPrompt
                when={formState.isValid && formState.isDirty && !isSubmitting}
                onSave={() => {
                    onSubmit(getValues())
                }}
            />
        </>
    )
}

export default ActionsPlatformAppForm
