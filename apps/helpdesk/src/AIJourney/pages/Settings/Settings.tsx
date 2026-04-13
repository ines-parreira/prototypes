import { useCallback, useEffect, useMemo } from 'react'

import { useBeforeUnload } from '@repo/hooks'
import { FormProvider, useForm } from 'react-hook-form'

import {
    Box,
    Button,
    PageHeader,
    TabItem,
    TabList,
    TabPanel,
    Tabs,
} from '@gorgias/axiom'

import { ComplianceTab, SenderIdentityTab } from 'AIJourney/components'
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
}

export const Settings = () => {
    const dispatch = useAppDispatch()
    const { currentIntegration } = useJourneyContext()

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
        },
    })

    const { formState, handleSubmit, reset } = methods

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
                })
                reset(values)
                void dispatch(
                    notify({
                        message: 'Settings saved successfully.',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch {
                void dispatch(
                    notify({
                        message: 'Error saving settings. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [saveConfiguration, reset, dispatch],
    )

    useBeforeUnload(formState.isDirty)

    if (error && isFetched) {
        return (
            <Box flexDirection="column" width="100%">
                <PageHeader title="Settings" />
            </Box>
        )
    }

    const isSaveDisabled = !formState.isDirty

    return (
        <FormProvider {...methods}>
            <Box flexDirection="column" width="100%">
                <PageHeader title="Settings">
                    <Button
                        isDisabled={isSaveDisabled}
                        onClick={handleSubmit(onSubmit)}
                    >
                        Save
                    </Button>
                </PageHeader>
                <FormUnsavedChangesPrompt
                    onSave={onSubmit}
                    shouldRedirectAfterSave
                />
                <div className={css.tabsContainer}>
                    <Tabs defaultSelectedItem={SettingsTab.SenderIdentity}>
                        <TabList>
                            <TabItem
                                id={SettingsTab.SenderIdentity}
                                label="Sender Identity"
                            />
                            <TabItem
                                id={SettingsTab.Compliance}
                                label="Compliance"
                            />
                            <TabItem
                                id={SettingsTab.Integrations}
                                label="Integrations"
                            />
                        </TabList>
                        <TabPanel id={SettingsTab.SenderIdentity}>
                            <SenderIdentityTab isFormReady={!isLoading} />
                        </TabPanel>
                        <TabPanel id={SettingsTab.Compliance}>
                            <ComplianceTab isFormReady={!isLoading} />
                        </TabPanel>
                        <TabPanel id={SettingsTab.Integrations} />
                    </Tabs>
                </div>
            </Box>
        </FormProvider>
    )
}
