import { useCallback } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Box, Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import Launcher from 'gorgias-design-system/Launcher/Launcher'
import useAppDispatch from 'hooks/useAppDispatch'
import { SalesVolumeData } from 'models/aiAgent/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './VolumeSettings.less'

const volumeSchema = z.object({
    isConversationStartersEnabled: z.boolean(),
})

const messages = [
    'Can this product be used daily?',
    'Is this suitable for sensitive skin?',
    'Does this contain fragrances?',
]

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
        },
        mode: 'onChange',
        resolver: zodResolver(volumeSchema),
    })

    const {
        watch,
        handleSubmit,
        setValue,
        reset,
        formState: { isSubmitting, isDirty },
    } = methods

    const isConversationStartersEnabled = watch('isConversationStartersEnabled')

    const toggle = useCallback(() => {
        setValue(
            'isConversationStartersEnabled',
            !isConversationStartersEnabled,
            {
                shouldDirty: true,
                shouldValidate: false,
            },
        )
    }, [isConversationStartersEnabled, setValue])

    const onSave = useCallback(async () => {
        if (storeConfiguration) {
            try {
                await updateStoreConfiguration({
                    ...storeConfiguration,
                    isConversationStartersEnabled,
                })

                void dispatch(
                    notify({
                        message: 'AI Agent configuration saved!',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to save volume configuration state',
                    }),
                )
            }
        }
    }, [
        isConversationStartersEnabled,
        updateStoreConfiguration,
        dispatch,
        storeConfiguration,
    ])

    const handleSave = useCallback(
        () => handleSubmit(onSave)(),
        [handleSubmit, onSave],
    )

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleSave}
                when={isDirty}
                onDiscard={reset}
                shouldRedirectAfterSave={true}
            />

            <FormProvider {...methods}>
                <Box flexDirection="row">
                    <Box className={css.white} flexDirection="column">
                        <Box className={css.left} flexDirection="column">
                            <Box>
                                <strong className={css.title}>
                                    Conversation Starters
                                </strong>
                            </Box>
                            <Box>
                                <p>
                                    Display up to 4 AI-generated conversation
                                    starters on product pages. Starters are
                                    high-quality, relevant, and easy to answer,
                                    tailored using your existing knowledge.
                                    Note: This overrides Convert campaigns.
                                </p>
                            </Box>
                            <Box>
                                <ToggleInput
                                    isDisabled={
                                        !isConversationStartersFeatureEnabled
                                    }
                                    isToggled={isConversationStartersEnabled}
                                    onClick={toggle}
                                >
                                    Enable conversation starters
                                </ToggleInput>
                            </Box>
                        </Box>
                        <Box className={css.buttonParent}>
                            <Button
                                isDisabled={!isDirty || isSubmitting}
                                onClick={handleSave}
                                intent="primary"
                                type="submit"
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Box>
                    <Box className={css.right} flexDirection="column">
                        <Box flexDirection="column">
                            <Box
                                className={css.preview}
                                alignSelf="flex-end"
                                flexDirection="column"
                            >
                                {messages.map((message) => (
                                    <Box
                                        alignSelf="flex-end"
                                        flexDirection="column"
                                        key={`message-${message}`}
                                    >
                                        <button className={css.starter}>
                                            {message}
                                        </button>
                                    </Box>
                                ))}
                            </Box>
                            <Box alignSelf="flex-end" flexDirection="column">
                                <Launcher shouldHideLabel />
                            </Box>
                            <Box flexDirection="column">
                                <small className={css.message}>
                                    Conversation starters preview
                                </small>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </FormProvider>
        </>
    )
}
