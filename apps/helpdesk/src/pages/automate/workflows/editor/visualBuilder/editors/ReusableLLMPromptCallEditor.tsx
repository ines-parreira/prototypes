import { LoadingSpinner } from '@gorgias/axiom'

import { useGetWorkflowConfigurationTemplate } from 'models/workflows/queries'
import ActionFormMerchantInputValue from 'pages/aiAgent/actions/components/ActionFormMerchantInputValue'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type {
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraphAppApp,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'
import InputField from 'pages/common/forms/input/InputField'

import ConnectTrackstarButton from '../components/ConnectTrackstarButton'
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
    const getInputProps = () => {
        switch (actionsApp?.auth_type) {
            case 'api-key':
                return {
                    dispatchEvent: (value: string) =>
                        dispatch({
                            type: 'SET_APP_API_KEY',
                            appId: actionsApp.id,
                            apiKey: value,
                        }),
                    value: graphApp?.api_key || '',
                    error: graphApp?.errors?.api_key,
                    touched: {
                        api_key: true,
                        refresh_token: false,
                    },
                    inputLabel:
                        actionsApp.auth_settings.input_label ?? 'API key',
                }
            case 'oauth2-token':
                return {
                    dispatchEvent: (value: string) =>
                        dispatch({
                            type: 'SET_APP_REFRESH_TOKEN',
                            appId: actionsApp.id,
                            refreshToken: value,
                        }),
                    value: graphApp?.refresh_token || '',
                    error: graphApp?.errors?.refresh_token,
                    touched: {
                        refresh_token: true,
                        api_key: false,
                    },
                    inputLabel:
                        actionsApp.auth_settings.input_label ?? 'Refresh token',
                }
        }
    }
    const renderInput = () => {
        const inputProps = getInputProps()
        if (!inputProps) return
        return (
            (actionsApp?.auth_type === 'api-key' ||
                actionsApp?.auth_type === 'oauth2-token') && (
                <>
                    <div>
                        This step requires an active {app.name} account. Enter
                        the {inputProps.inputLabel} from your {app.name}{' '}
                        account.{' '}
                        {actionsApp.auth_settings?.url && (
                            <a
                                href={actionsApp.auth_settings.url}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {actionsApp.auth_settings
                                    .instruction_url_text ??
                                    `Find your ${inputProps.inputLabel} in ${app.name}.`}
                            </a>
                        )}
                    </div>
                    <InputField
                        label={inputProps.inputLabel}
                        autoFocus={true}
                        isRequired
                        type="text"
                        value={inputProps.value}
                        onChange={(nextValue) => {
                            inputProps.dispatchEvent(nextValue)
                        }}
                        error={inputProps.error}
                        onBlur={() => {
                            dispatch({
                                type: 'SET_TOUCHED',
                                appId: app.id,
                                touched: inputProps.touched,
                            })
                        }}
                    />
                </>
            )
        )
    }
    return (
        <>
            <NodeEditorDrawerHeader label={`${step.name} in ${app.name}`} />
            <Drawer.Content>
                <div className={css.container}>
                    {hasAuthentication && (
                        <div className={css.reusableLLMPromptCallStepSection}>
                            {renderInput()}
                            {actionsApp.auth_type === 'trackstar' && (
                                <ConnectTrackstarButton
                                    app={app}
                                    actionApp={actionsApp}
                                />
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
