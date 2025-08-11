import { Controller, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import InputField from 'pages/common/forms/input/InputField'
import { validateWebhookURL } from 'utils'

import { ActionsApp, App } from '../types'
import ActionsPlatformAppSelectBox from './ActionsPlatformAppSelectBox'
import ActionsPlatformAuthTypeSelectBox from './ActionsPlatformAuthTypeSelectBox'
import ActionsPlatformTrackstarIntegrationSelectBox from './ActionsPlatformTrackstarIntegrationSelectBox'

import css from './ActionsPlatformAppForm.less'

type AppWithUrl = Exclude<ActionsApp, { auth_type: 'trackstar' }>

const INSTRUCTIONS_URL_CAPTION_BY_AUTH_TYPE: Record<
    AppWithUrl['auth_type'],
    string
> = {
    'api-key': 'URL with instructions on how to find an API key',
    'oauth2-token': 'URL with instructions on how to find a refresh token url',
}

const LABEL_BY_AUTH_TYPE: Record<AppWithUrl['auth_type'], string> = {
    'api-key': 'API key',
    'oauth2-token': 'refresh token url',
}

type Props = {
    value?: ActionsApp
    apps: Extract<App, { type: IntegrationType.App }>[]
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

    const { control, reset, getValues, formState, watch } = useForm<ActionsApp>(
        {
            defaultValues: { auth_type: 'api-key' },
            values: value,
        },
    )
    const authType = watch('auth_type')

    const isNewActionsApp = !value

    const defaultAppName = apps.find((app) => app.id === value?.id)?.name

    return (
        <>
            <Button
                fillStyle="ghost"
                intent="secondary"
                onClick={() => {
                    history.push('/app/ai-agent/actions-platform/apps')
                }}
                className={css.backButton}
                leadingIcon="arrow_back"
            >
                Back to Apps
            </Button>
            <div className={css.section}>
                <Controller
                    control={control}
                    name="id"
                    rules={{
                        required: true,
                    }}
                    render={({ field: { value, onChange } }) => (
                        <ActionsPlatformAppSelectBox
                            value={value}
                            onChange={onChange}
                            isDisabled={!isNewActionsApp}
                            apps={apps}
                        />
                    )}
                />
                {defaultAppName && (
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                label="Name"
                                value={value ?? ''}
                                onChange={onChange}
                                placeholder={defaultAppName}
                            />
                        )}
                    />
                )}
                <Controller
                    control={control}
                    name="auth_type"
                    rules={{
                        required: true,
                    }}
                    render={({ field: { value, onChange } }) => (
                        <ActionsPlatformAuthTypeSelectBox
                            value={value}
                            onChange={onChange}
                            isDisabled={!isNewActionsApp}
                        />
                    )}
                />
                {authType === 'trackstar' && (
                    <Controller
                        control={control}
                        name="auth_settings.integration_name"
                        rules={{
                            required: true,
                        }}
                        render={({ field: { value, onChange } }) => (
                            <ActionsPlatformTrackstarIntegrationSelectBox
                                value={value}
                                onChange={onChange}
                            />
                        )}
                    />
                )}
                {authType !== 'trackstar' && (
                    <Controller
                        control={control}
                        name="auth_settings.url"
                        rules={{
                            required: true,
                            validate: (value) =>
                                validateWebhookURL(value ?? '') || undefined,
                        }}
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                isRequired
                                label="Instructions URL"
                                value={value ?? ''}
                                onChange={onChange}
                                caption={
                                    INSTRUCTIONS_URL_CAPTION_BY_AUTH_TYPE[
                                        authType
                                    ]
                                }
                                placeholder="https://link.gorgias.com/xyz"
                            />
                        )}
                    />
                )}

                {authType === 'oauth2-token' && (
                    <Controller
                        control={control}
                        name="auth_settings.refresh_token_url"
                        shouldUnregister
                        rules={{
                            required: true,
                            validate: (value) =>
                                validateWebhookURL(value ?? '') || undefined,
                        }}
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                isRequired
                                label="Refresh token endpoint URL"
                                value={value ?? ''}
                                onChange={onChange}
                            />
                        )}
                    />
                )}
                {authType === 'api-key' && (
                    <Controller
                        control={control}
                        name="auth_settings.input_label"
                        shouldUnregister
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                label="Input label"
                                value={value ?? ''}
                                onChange={onChange}
                                placeholder="API Key"
                            />
                        )}
                    />
                )}
                {authType !== 'trackstar' && (
                    <Controller
                        control={control}
                        name="auth_settings.instruction_url_text"
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                label="Instructions URL text"
                                value={value ?? ''}
                                onChange={onChange}
                                placeholder={`Find your ${LABEL_BY_AUTH_TYPE[authType]} in ${apps.find((app) => app.id === getValues().id)?.name || 'App'} `}
                            />
                        )}
                    />
                )}
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
