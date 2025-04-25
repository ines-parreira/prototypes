import { useCallback } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Box, Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import { ConversationPreview } from 'pages/aiAgent/components/VolumeSettings/ConversationPreview'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { ConversationLauncherSettings } from './ConversationLauncherSettings'
import { ConversationStartersSettings } from './ConversationStartersSettings'

import css from './VolumeSettings.less'

const volumeSchema = z.object({
    isConversationStartersEnabled: z.boolean(),
    isFloatingInputEnabled: z.boolean(),
    isFloatingInputDesktopOnly: z.boolean(),
})

type SalesVolumeData = z.infer<typeof volumeSchema>

export const VolumeSettings = () => {
    const dispatch = useAppDispatch()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const flags = useFlags()
    const isConversationStartersFeatureEnabled =
        flags[FeatureFlagKey.ConversationStarters]

    const methods = useForm<SalesVolumeData>({
        values: {
            isConversationStartersEnabled:
                storeConfiguration?.isConversationStartersEnabled ?? false,
            isFloatingInputEnabled:
                storeConfiguration?.floatingChatInputConfiguration?.isEnabled ??
                false,
            isFloatingInputDesktopOnly:
                storeConfiguration?.floatingChatInputConfiguration
                    ?.isDesktopOnly ?? false,
        },
        mode: 'onChange',
        resolver: zodResolver(volumeSchema),
    })

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting, isDirty },
    } = methods

    const onSave = useCallback(
        async (data: SalesVolumeData) => {
            if (storeConfiguration) {
                try {
                    await updateStoreConfiguration({
                        ...storeConfiguration,
                        isConversationStartersEnabled:
                            data.isConversationStartersEnabled,
                        floatingChatInputConfiguration: {
                            ...storeConfiguration?.floatingChatInputConfiguration,
                            isEnabled: data.isFloatingInputEnabled,
                            isDesktopOnly: data.isFloatingInputDesktopOnly,
                        },
                    })

                    void dispatch(
                        notify({
                            message: CHANGES_SAVED_SUCCESS,
                            status: NotificationStatus.Success,
                        }),
                    )
                } catch {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'Failed to save volume configuration state',
                        }),
                    )
                }
            }
        },
        [updateStoreConfiguration, storeConfiguration, dispatch],
    )

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleSubmit(onSave)}
                when={isDirty}
                onDiscard={reset}
                shouldRedirectAfterSave
            />

            <FormProvider {...methods}>
                <Box className={css.container} flexDirection="row">
                    <Box
                        className={css.leftColumn}
                        flexDirection="column"
                        flexGrow={1}
                    >
                        <p className={css.headTitle}>Chat Widget</p>
                        <ConversationStartersSettings
                            isEnabled={isConversationStartersFeatureEnabled}
                        />
                        <ConversationLauncherSettings />
                        <Box className={css.saveButtonWrapper}>
                            <Button
                                isDisabled={!isDirty || isSubmitting}
                                onClick={handleSubmit(onSave)}
                                intent="primary"
                                type="submit"
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Box>

                    <ConversationPreview />
                </Box>
            </FormProvider>
        </>
    )
}
