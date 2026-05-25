import { useEffect } from 'react'

import type { Map } from 'immutable'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/GorgiasChatRevampLayout'
import { useIsAiAgentEnabled } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useIsAiAgentEnabled'
import SaveChangesPrompt from 'pages/integrations/integration/components/gorgias_chat/revamp/CreationWizard/components/SaveChangesPrompt'
import { AvatarCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/AvatarCard/AvatarCard'
import { BrandCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/BrandCard/BrandCard'
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
    const { isAiAgentEnabled, isLoading: isAiAgentConfigLoading } =
        useIsAiAgentEnabled(storeIntegration, integration.get('id'))
    const shouldShowAdvancedColors =
        !isAiAgentConfigLoading && !isAiAgentEnabled

    const { reloadPreview, onChatPreviewLoaded, updateLegalDisclaimerEnabled } =
        useChatPreviewPanelContext()

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updateLegalDisclaimerEnabled(values.legalDisclaimerEnabled)
        }, true)
    }, [
        onChatPreviewLoaded,
        updateLegalDisclaimerEnabled,
        values.legalDisclaimerEnabled,
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
                            mainColor={values.mainColor}
                            conversationColor={values.conversationColor}
                            useMainColorOutsideBusinessHours={
                                values.useMainColorOutsideBusinessHours
                            }
                            headerPictureUrl={values.headerPictureUrl}
                            headerAlternativePictureUrl={
                                values.headerAlternativePictureUrl
                            }
                            showAdvancedColors={shouldShowAdvancedColors}
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
                            onHeaderLogoUrlChange={(url) =>
                                setValue('headerPictureUrl', url)
                            }
                            onHeaderAlternativePictureUrlChange={(url) =>
                                setValue('headerAlternativePictureUrl', url)
                            }
                        />
                        <ChatLauncherCard
                            launcher={values.launcher}
                            mainColor={values.mainColor}
                            position={values.position}
                            onLauncherChange={(launcher) =>
                                setValue('launcher', launcher)
                            }
                            onPositionChange={(position) =>
                                setValue('position', position)
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
                    </div>
                </div>
            </GorgiasChatRevampLayout>
        </>
    )
}
