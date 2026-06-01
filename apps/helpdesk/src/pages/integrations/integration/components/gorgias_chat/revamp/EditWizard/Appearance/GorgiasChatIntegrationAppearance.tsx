import { useEffect } from 'react'

import type { Map } from 'immutable'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/GorgiasChatRevampLayout'
import { useIsAiAgentEnabled } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useIsAiAgentEnabled'
import SaveChangesPrompt from 'pages/integrations/integration/components/gorgias_chat/revamp/CreationWizard/components/SaveChangesPrompt'
import { AvatarCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/AvatarCard/AvatarCard'
import { BrandCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/BrandCard/BrandCard'
import { ChatbotCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/ChatbotCard/ChatbotCard'
import { ChatLauncherCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/ChatLauncherCard/ChatLauncherCard'
import { LegalCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/LegalCard/LegalCard'
import { useAppearanceForm } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/hooks/useAppearanceForm'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import css from './GorgiasChatIntegrationAppearance.less'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
}

export const GorgiasChatIntegrationAppearanceRevamp = ({
    integration,
    loading,
}: Props) => {
    const {
        handleSubmit,
        setValue,
        values,
        isSubmitting,
        isDirty,
        privacyPolicyText,
        setPrivacyPolicyText,
        onSubmit,
    } = useAppearanceForm({ integration, loading })

    const { storeIntegration } = useStoreIntegration(integration)
    const rawChatId: unknown = integration.get('id')
    const chatId = typeof rawChatId === 'number' ? rawChatId : undefined
    const { isAiAgentEnabled, isLoading: isAiAgentConfigLoading } =
        useIsAiAgentEnabled(storeIntegration, chatId)
    const isAiAgentDisabled = !isAiAgentConfigLoading && !isAiAgentEnabled

    const {
        reloadPreview,
        onChatPreviewLoaded,
        updateLegalDisclaimerEnabled,
        updateMainFontFamily,
        updateConversationColor,
    } = useChatPreviewPanelContext()

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updateConversationColor(values.conversationColor)
            updateLegalDisclaimerEnabled(values.legalDisclaimerEnabled)
        }, true)
    }, [
        updateConversationColor,
        onChatPreviewLoaded,
        updateLegalDisclaimerEnabled,
        values.legalDisclaimerEnabled,
        values.conversationColor,
    ])

    const onSave = handleSubmit(onSubmit)

    return (
        <>
            <SaveChangesPrompt
                when={isDirty}
                onSave={onSave}
                onDiscard={reloadPreview}
                shouldRedirectAfterSave
            />
            <GorgiasChatRevampLayout
                integration={integration}
                onSave={onSave}
                isSaving={isSubmitting}
                isSaveDisabled={!isDirty}
            >
                <div className={css.appearanceTab}>
                    <div className={css.cardsWrapper}>
                        <BrandCard
                            name={values.name}
                            mainColor={values.mainColor}
                            conversationColor={values.conversationColor}
                            useMainColorOutsideBusinessHours={
                                values.useMainColorOutsideBusinessHours
                            }
                            backgroundStyle={values.backgroundStyle}
                            headerPictureUrl={values.headerPictureUrl}
                            headerAlternativePictureUrl={
                                values.headerAlternativePictureUrl
                            }
                            introductionText={values.introductionText}
                            offlineIntroductionText={
                                values.offlineIntroductionText
                            }
                            isAiAgentEnabled={isAiAgentEnabled}
                            isAiAgentDisabled={isAiAgentDisabled}
                            onNameChange={(value) => setValue('name', value)}
                            onMainColorChange={(value) =>
                                setValue('mainColor', value)
                            }
                            onConversationColorChange={(value) =>
                                setValue('conversationColor', value)
                            }
                            onUseMainColorOutsideBusinessHoursChange={(value) =>
                                setValue(
                                    'useMainColorOutsideBusinessHours',
                                    value,
                                )
                            }
                            onBackgroundStyleChange={(value) =>
                                setValue('backgroundStyle', value)
                            }
                            onHeaderLogoUrlChange={(url) =>
                                setValue('headerPictureUrl', url)
                            }
                            onHeaderAlternativePictureUrlChange={(url) =>
                                setValue('headerAlternativePictureUrl', url)
                            }
                            onIntroductionTextChange={(value) =>
                                setValue('introductionText', value)
                            }
                            onOfflineIntroductionTextChange={(value) =>
                                setValue('offlineIntroductionText', value)
                            }
                            mainFontFamily={values.mainFontFamily}
                            onMainFontFamilyChange={(value: string): void => {
                                setValue('mainFontFamily', value)
                                updateMainFontFamily(value)
                            }}
                        />
                        <ChatLauncherCard
                            launcher={values.launcher}
                            mainColor={values.mainColor}
                            position={values.position}
                            largeChatEnabled={values.largeChatEnabled}
                            onLauncherChange={(launcher) =>
                                setValue('launcher', launcher)
                            }
                            onPositionChange={(position) =>
                                setValue('position', position)
                            }
                            onLargeChatEnabledChange={(value) =>
                                setValue('largeChatEnabled', value)
                            }
                        />
                        <LegalCard
                            legalDisclaimerText={privacyPolicyText}
                            legalDisclaimerEnabled={
                                values.legalDisclaimerEnabled
                            }
                            onLegalDisclaimerTextChange={setPrivacyPolicyText}
                            onLegalDisclaimerEnabledChange={(value) =>
                                setValue('legalDisclaimerEnabled', value)
                            }
                        />
                        <AvatarCard
                            name={values.name}
                            avatar={values.avatar}
                            onAvatarChange={(avatar) =>
                                setValue('avatar', avatar)
                            }
                        />
                        {isAiAgentDisabled && (
                            <ChatbotCard
                                displayBotLabel={values.displayBotLabel}
                                onDisplayBotLabelChange={(value) =>
                                    setValue('displayBotLabel', value)
                                }
                            />
                        )}
                    </div>
                </div>
            </GorgiasChatRevampLayout>
        </>
    )
}
