import React from 'react'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { useGetWorkflowConfigurationTemplate } from 'models/workflows/queries'
import ActionFormMerchantInputValue from 'pages/aiAgent/actions/components/ActionFormMerchantInputValue'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraphAppApp,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'
import InputField from 'pages/common/forms/input/InputField'

import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function ReusableLLMPromptCallEditor({
    nodeInEdition,
}: {
    nodeInEdition: ReusableLLMPromptCallNodeType
}) {
    const { dispatch, visualBuilderGraph } = useVisualBuilderContext()

    const { data: step } = useGetWorkflowConfigurationTemplate(
        nodeInEdition.data.configuration_id,
    )
    const { apps, actionsApps } = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({ apps })

    if (!step) {
        return <LoadingSpinner size="medium" />
    }

    const templateApp = step.apps[0]
    const inputs = step.inputs ?? []
    const values = nodeInEdition.data.values

    const actionsApp = actionsApps.find(
        (actionsApp) =>
            templateApp.type === 'app' && actionsApp.id === templateApp.app_id,
    )
    const app = getAppFromTemplateApp(templateApp)

    if (!app) {
        return <LoadingSpinner size="medium" />
    }

    const hasAuthentication = !visualBuilderGraph.isTemplate && actionsApp
    const hasInputs = !!inputs.length

    const graphApp =
        actionsApp &&
        visualBuilderGraph.apps?.find(
            (app): app is VisualBuilderGraphAppApp =>
                app.type === 'app' && app.app_id === actionsApp.id,
        )

    return (
        <>
            <NodeEditorDrawerHeader label={`${step.name} in ${app.name}`} />
            <Drawer.Content>
                <div className={css.container}>
                    {hasAuthentication && (
                        <div className={css.reusableLLMPromptCallStepSection}>
                            {actionsApp.auth_type === 'api-key' && (
                                <>
                                    <div>
                                        This step requires an active {app.name}{' '}
                                        account. Enter the API key from your{' '}
                                        {app.name} account.
                                    </div>
                                    <InputField
                                        label={
                                            actionsApp.auth_settings
                                                .input_label ?? 'API key'
                                        }
                                        isRequired
                                        type="text"
                                        value={graphApp?.api_key ?? ''}
                                        onChange={(nextValue) => {
                                            dispatch({
                                                type: 'SET_APP_API_KEY',
                                                appId: actionsApp.id,
                                                apiKey: nextValue,
                                            })
                                        }}
                                        error={graphApp?.errors?.api_key}
                                        caption={
                                            actionsApp.auth_settings.url && (
                                                <a
                                                    href={
                                                        actionsApp.auth_settings
                                                            .url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                >
                                                    {actionsApp.auth_settings
                                                        .instruction_url_text ??
                                                        `Find your API key in ${app.name}`}
                                                </a>
                                            )
                                        }
                                        onBlur={() => {
                                            dispatch({
                                                type: 'SET_TOUCHED',
                                                appId: app.id,
                                                touched: {
                                                    api_key: true,
                                                },
                                            })
                                        }}
                                    />
                                </>
                            )}
                            {actionsApp.auth_type === 'oauth2-token' && (
                                <>
                                    <div>
                                        This step requires an active {app.name}{' '}
                                        account. Enter the refresh token from
                                        your {app.name} account.
                                    </div>
                                    <InputField
                                        label="Refresh token"
                                        isRequired
                                        type="text"
                                        value={graphApp?.refresh_token ?? ''}
                                        onChange={(nextValue) => {
                                            dispatch({
                                                type: 'SET_APP_REFRESH_TOKEN',
                                                appId: actionsApp.id,
                                                refreshToken: nextValue,
                                            })
                                        }}
                                        error={graphApp?.errors?.refresh_token}
                                        caption={
                                            actionsApp.auth_settings.url && (
                                                <a
                                                    href={
                                                        actionsApp.auth_settings
                                                            .url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                >
                                                    {actionsApp.auth_settings
                                                        .instruction_url_text ??
                                                        `Find your refresh token in ${app.name}`}
                                                </a>
                                            )
                                        }
                                        onBlur={() => {
                                            dispatch({
                                                type: 'SET_TOUCHED',
                                                appId: app.id,
                                                touched: {
                                                    refresh_token: true,
                                                },
                                            })
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {hasAuthentication && hasInputs && (
                        <div className={css.separator} />
                    )}

                    {hasInputs && (
                        <div className={css.reusableLLMPromptCallStepSection}>
                            <div>This step requires additional values.</div>
                            <div
                                className={css.reusableLLMPromptCallStepInputs}
                            >
                                {inputs.map((input) => (
                                    <ActionFormMerchantInputValue
                                        key={input.id}
                                        input={input}
                                        value={values[input.id]}
                                        onChange={(nextValue) => {
                                            dispatch({
                                                type: 'SET_REUSABLE_LLM_PROMPT_CALL_VALUE',
                                                reusableLLMPromptCallNodeId:
                                                    nodeInEdition.id,
                                                inputId: input.id,
                                                value: nextValue,
                                            })
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Drawer.Content>
        </>
    )
}
