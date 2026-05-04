import { useCallback, useEffect, useMemo } from 'react'

import { useBeforeUnload } from '@repo/hooks'
import { FormProvider, useForm } from 'react-hook-form'
import {
    Redirect,
    useHistory,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

import {
    Box,
    Button,
    PanelHeader,
    TabItem,
    TabList,
    TabPanel,
    Tabs,
} from '@gorgias/axiom'

import {
    ComplianceTab,
    IntegrationsTab,
    SenderIdentityTab,
} from 'AIJourney/components'
import { useAiJourneyStoreConfiguration } from 'AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration'
import { useJourneyContext } from 'AIJourney/providers'
import useAppDispatch from 'hooks/useAppDispatch'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './Settings.less'

enum SettingsTab {
    SenderIdentity = 'sender-identity',
    Compliance = 'compliance',
    Integrations = 'integrations',
}

type SmsSender = {
    sms_sender_integration_id: number | null
    sms_sender_number: string | null
}

type SettingsFormValues = {
    sms_sender: SmsSender
    brand_name: string
    texas_exclusion_enabled: boolean
    klaviyo_api_key: string | null
    quiet_hours_start: string | null
    quiet_hours_end: string | null
}

export const Settings = () => {
    const dispatch = useAppDispatch()
    const { currentIntegration } = useJourneyContext()
    const { url } = useRouteMatch()
    const { pathname } = useLocation()
    const history = useHistory()

    const tabRoutes = {
        [SettingsTab.SenderIdentity]: `${url}/${SettingsTab.SenderIdentity}`,
        [SettingsTab.Compliance]: `${url}/${SettingsTab.Compliance}`,
        [SettingsTab.Integrations]: `${url}/${SettingsTab.Integrations}`,
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
        },
    })

    const { formState, handleSubmit, reset, setError } = methods

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
            })
        }
    }, [storeConfiguration, reset])

    const onSubmit = useCallback(
        async (values: SettingsFormValues) => {
            try {
                await saveConfiguration({
                    sms_sender_integration_id:
                        values.sms_sender.sms_sender_integration_id,
                    sms_sender_number: values.sms_sender.sms_sender_number,
                    brand_name: values.brand_name,
                    texas_exclusion_enabled: values.texas_exclusion_enabled,
                    klaviyo_api_key: values.klaviyo_api_key,
                    quiet_hours_start: values.quiet_hours_start,
                    quiet_hours_end: values.quiet_hours_end,
                })
                reset(values)
                void dispatch(
                    notify({
                        message: 'Settings saved successfully.',
                        status: NotificationStatus.Success,
                    }),
                )
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

                if (Array.isArray(detail)) {
                    for (const fieldError of detail) {
                        if ('klaviyo_api_key' in fieldError) {
                            setError('klaviyo_api_key', {
                                message: fieldError.klaviyo_api_key,
                            })
                            throw error
                        }
                    }
                }

                if (response?.status === 422) {
                    setError('klaviyo_api_key', {
                        message:
                            'Invalid Klaviyo API key. Please check your key and try again.',
                    })
                    throw error
                }

                void dispatch(
                    notify({
                        message: 'Error saving settings. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )
                throw error
            }
        },
        [saveConfiguration, reset, dispatch, setError],
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
                    </Tabs>
                </div>
            </Box>
        </FormProvider>
    )
}
