import React, {useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useHistory} from 'react-router-dom'

import {IntegrationType} from 'models/integration/constants'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import {ActionsApp, App} from '../types'
import css from './ActionsPlatformAppForm.less'
import ActionsPlatformAppSelectBox from './ActionsPlatformAppSelectBox'
import ActionsPlatformAuthTypeSelectBox from './ActionsPlatformAuthTypeSelectBox'

import UrlInput from './UrlInput'

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

    const {control, reset, getValues, formState, watch, register, unregister} =
        useForm<ActionsApp>({
            defaultValues: {auth_type: 'api-key'},
            values: value,
        })
    const authType = watch('auth_type')
    useEffect(() => {
        if (
            value?.auth_type === 'oauth2-token' ||
            authType === 'oauth2-token'
        ) {
            register('auth_settings.refresh_token_url')
        } else {
            unregister('auth_settings.refresh_token_url')
        }
    }, [register, unregister, authType, value?.auth_type])

    const isNewActionsApp = !value

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
                <UrlInput
                    control={control}
                    name={'auth_settings.url'}
                    label={'Instructions URL'}
                    caption={`URL with instructions on how to find ${authType === 'oauth2-token' ? 'a refresh token url' : 'an API key'}.`}
                    placeholder={'https://link.gorgias.com/xyz'}
                />
                {authType === 'oauth2-token' && (
                    <UrlInput
                        control={control}
                        name={'auth_settings.refresh_token_url'}
                        label={'Token refresh endpoint'}
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
