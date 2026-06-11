import { useCallback, useEffect, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { FormProvider, useForm } from 'react-hook-form'
import {
    Redirect,
    useHistory,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'
import { useBeforeUnload } from '@gorgias/toolkit-react'

import {
    Box,
    Button,
    Card,
    CardHeader,
    Link,
    PanelHeader,
    TabItem,
    TabList,
    TabPanel,
    Tabs,
    Text,
    toast,
} from '@gorgias/axiom'
import type {
    JourneyParticipationExecutionMode,
    StoreConfigurationRequestSchema,
} from '@gorgias/convert-client'

import {
    ComplianceTab,
    ExecutionModeCard,
    IntegrationsTab,
    SenderIdentityTab,
} from 'AIJourney/components'
import { useAiJourneyStoreConfiguration } from 'AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration'
import { useJourneyContext } from 'AIJourney/providers'
import { FormUnsavedChangesPrompt } from 'pages/common/components/FormUnsavedChangesPrompt'

import css from './Settings.less'

enum SettingsTab {
    SenderIdentity = 'sender-identity',
    Compliance = 'compliance',
    Integrations = 'integrations',
    Internal = 'internal',
}

type SmsSender = {
    sms_sender_integration_id: number | null
    sms_sender_number: string | null
}

export type SettingsFormValues = {
    sms_sender: SmsSender
    brand_name: string
    texas_exclusion_enabled: boolean
    klaviyo_api_key: string | null
    quiet_hours_start: string | null
    quiet_hours_end: string | null
    execution_mode_override: JourneyParticipationExecutionMode | null
    tone_of_voice_guidance: string | null
}

export const Settings = () => {
    const { currentIntegration } = useJourneyContext()
    const { url } = useRouteMatch()
    const { pathname } = useLocation()
    const history = useHistory()

    const isImpersonated = !!window.USER_IMPERSONATED

    const { value: isToneOfVoiceEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyToneOfVoice,
    )
    const { value: isAiJourneyRcsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyRcsEnable,
    )

    const rcsTestSendUrl = url.replace(/\/settings\/?$/, '/rcs-test-send')

    const tabRoutes = {
        [SettingsTab.SenderIdentity]: `${url}/${SettingsTab.SenderIdentity}`,
        [SettingsTab.Compliance]: `${url}/${SettingsTab.Compliance}`,
        [SettingsTab.Integrations]: `${url}/${SettingsTab.Integrations}`,
        ...(isImpersonated && {
            [SettingsTab.Internal]: `${url}/${SettingsTab.Internal}`,
        }),
    }

    const storeIntegrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const {
        storeConfiguration,
        isLoading,
        error,
        isFetched,
        saveConfiguration,
    } = useAiJourneyStoreConfiguration(storeIntegrationId)

    const methods = useForm<SettingsFormValues>({
        defaultValues: {
            sms_sender: {
                sms_sender_integration_id: null,
                sms_sender_number: null,
            },
            brand_name: '',
            texas_exclusion_enabled: false,
            klaviyo_api_key: null,
            quiet_hours_start: null,
            quiet_hours_end: null,
            execution_mode_override: null,
            tone_of_voice_guidance: null,
        },
    })

    const { formState, handleSubmit, reset, setError } = methods
    const { dirtyFields } = formState

    useEffect(() => {
        if (storeConfiguration) {
            reset({
                sms_sender: {
                    sms_sender_integration_id:
                        storeConfiguration.sms_sender_integration_id ?? null,
                    sms_sender_number:
                        storeConfiguration.sms_sender_number ?? null,
                },
                brand_name: storeConfiguration.brand_name ?? '',
                texas_exclusion_enabled:
                    storeConfiguration.texas_exclusion_enabled ?? false,
                klaviyo_api_key: storeConfiguration.klaviyo_api_key ?? null,
                quiet_hours_start: storeConfiguration.quiet_hours_start ?? null,
                quiet_hours_end: storeConfiguration.quiet_hours_end ?? null,
                execution_mode_override:
                    storeConfiguration.execution_mode_override ?? null,
                tone_of_voice_guidance:
                    storeConfiguration.tone_of_voice_guidance ?? null,
            })
        }
    }, [storeConfiguration, reset])

    const onSubmit = useCallback(
        async (values: SettingsFormValues) => {
            try {
                const payload: StoreConfigurationRequestSchema = {
                    sms_sender_integration_id:
                        values.sms_sender.sms_sender_integration_id,
                    sms_sender_number: values.sms_sender.sms_sender_number,
                    brand_name: values.brand_name,
                    texas_exclusion_enabled: values.texas_exclusion_enabled,
                    quiet_hours_start: values.quiet_hours_start,
                    quiet_hours_end: values.quiet_hours_end,
                    ...(dirtyFields.klaviyo_api_key && {
                        klaviyo_api_key: values.klaviyo_api_key,
                    }),
                    ...(isToneOfVoiceEnabled && {
                        tone_of_voice_guidance: values.tone_of_voice_guidance,
                    }),
                    ...(isImpersonated && {
                        execution_mode_override: values.execution_mode_override,
                    }),
                }
                await saveConfiguration(payload)
                reset(values)
                toast.success('Settings saved successfully.')
            } catch (error) {
                const response = (
                    error as {
                        response?: {
                            status?: number
                            data?: {
                                detail?: Array<Record<string, string>> | null
                            }
                        }
                    }
                )?.response
                const detail = response?.data?.detail

                const klaviyoFieldError = Array.isArray(detail)
                    ? detail.find(
                          (fieldError) => 'klaviyo_api_key' in fieldError,
                      )
                    : undefined

                if (klaviyoFieldError) {
                    setError('klaviyo_api_key', {
                        message: klaviyoFieldError.klaviyo_api_key,
                    })
                } else if (response?.status === 422) {
                    setError('klaviyo_api_key', {
                        message:
                            'Invalid Klaviyo API key. Please check your key and try again.',
                    })
                }

                toast.error('Error saving settings. Please try again.')
                throw error
            }
        },
        [
            saveConfiguration,
            reset,
            setError,
            isImpersonated,
            isToneOfVoiceEnabled,
            dirtyFields.klaviyo_api_key,
        ],
    )

    const handleSaveClick = useCallback(
        () => void handleSubmit(onSubmit)().catch(() => {}),
        [handleSubmit, onSubmit],
    )

    useBeforeUnload(formState.isDirty)

    if (!Object.values(tabRoutes).includes(pathname)) {
        return <Redirect to={tabRoutes[SettingsTab.SenderIdentity]} />
    }

    if (error && isFetched) {
        return (
            <Box flexDirection="column" width="100%">
                <PanelHeader title="Settings" />
            </Box>
        )
    }

    const isSaveDisabled = !formState.isDirty || formState.isSubmitting

    return (
        <FormProvider {...methods}>
            <Box flexDirection="column" width="100%">
                <PanelHeader
                    title="Settings"
                    trailingSlot={
                        <Button
                            isDisabled={isSaveDisabled}
                            isLoading={formState.isSubmitting}
                            onClick={handleSaveClick}
                        >
                            Save
                        </Button>
                    }
                />
                <FormUnsavedChangesPrompt
                    onSave={onSubmit}
                    onDiscard={reset}
                    shouldRedirectAfterSave
                />
                <div className={css.tabsContainer}>
                    <Tabs
                        selectedItem={pathname}
                        onSelectionChange={(path) =>
                            history.push(path as string)
                        }
                    >
                        <TabList>
                            <TabItem
                                id={tabRoutes[SettingsTab.SenderIdentity]}
                                label="Sender Identity"
                            />
                            <TabItem
                                id={tabRoutes[SettingsTab.Compliance]}
                                label="Compliance"
                            />
                            <TabItem
                                id={tabRoutes[SettingsTab.Integrations]}
                                label="Integrations"
                            />
                            {isImpersonated && (
                                <TabItem
                                    id={tabRoutes[SettingsTab.Internal]!}
                                    label="Internal"
                                />
                            )}
                        </TabList>
                        <TabPanel id={tabRoutes[SettingsTab.SenderIdentity]}>
                            <SenderIdentityTab isFormReady={!isLoading} />
                        </TabPanel>
                        <TabPanel id={tabRoutes[SettingsTab.Compliance]}>
                            <ComplianceTab isFormReady={!isLoading} />
                        </TabPanel>
                        <TabPanel id={tabRoutes[SettingsTab.Integrations]}>
                            <IntegrationsTab isFormReady={!isLoading} />
                        </TabPanel>
                        {isImpersonated && (
                            <TabPanel id={tabRoutes[SettingsTab.Internal]!}>
                                <Box flexDirection="column" gap="md">
                                    <ExecutionModeCard
                                        isFormReady={!isLoading}
                                        title="Store-level execution mode"
                                        description="Default execution mode for all flows in this store. If unset, flows fall back to Dry run. Per-flow overrides on the Setup screen take precedence over this value."
                                        showDefaultOption={true}
                                        defaultOptionLabel="No override"
                                        defaultOptionDescription="Clears the store-level value. Flows fall back to Dry run (system default)."
                                    />
                                    {isAiJourneyRcsEnabled && (
                                        <Card width={680}>
                                            <CardHeader title="RCS test send" />
                                            <Box
                                                flexDirection="column"
                                                gap="sm"
                                            >
                                                <Text color="content-neutral-secondary">
                                                    Resolve a Twilio RCS
                                                    template from a hand-crafted
                                                    payload and send (or
                                                    dry-run) a test message via
                                                    the production resolver.
                                                </Text>
                                                <Box flexDirection="row">
                                                    <Link
                                                        href={rcsTestSendUrl}
                                                        trailingSlot="arrow-right"
                                                    >
                                                        Open RCS test send
                                                    </Link>
                                                </Box>
                                            </Box>
                                        </Card>
                                    )}
                                </Box>
                            </TabPanel>
                        )}
                    </Tabs>
                </div>
            </Box>
        </FormProvider>
    )
}
