import type { Map } from 'immutable'

import { AvatarCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/AvatarCard/AvatarCard'
import { BrandCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/BrandCard/BrandCard'
import { ChatLauncherCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/ChatLauncherCard/ChatLauncherCard'
import { LegalCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/LegalCard/LegalCard'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import { useAppearanceForm } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useAppearanceForm'

import css from './components/GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance.less'

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
        privacyPolicyText,
        setPrivacyPolicyText,
        onSubmit,
    } = useAppearanceForm({ integration, loading })

    return (
        <GorgiasChatRevampLayout
            integration={integration}
            onSave={handleSubmit(onSubmit)}
            isSaving={isSubmitting}
        >
            <div className={css.appearanceTab}>
                <div className={css.cardsWrapper}>
                    <BrandCard
                        mainColor={values.mainColor}
                        headerPictureUrl={values.headerPictureUrl}
                        onMainColorChange={(value) =>
                            setValue('mainColor', value)
                        }
                        onHeaderLogoUrlChange={(url) =>
                            setValue('headerPictureUrl', url)
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
                        legalDisclaimerEnabled={values.legalDisclaimerEnabled}
                        onLegalDisclaimerTextChange={setPrivacyPolicyText}
                        onLegalDisclaimerEnabledChange={(value) =>
                            setValue('legalDisclaimerEnabled', value)
                        }
                    />
                    <AvatarCard
                        name={values.name}
                        avatar={values.avatar}
                        onNameChange={(value) => setValue('name', value)}
                        onAvatarChange={(avatar) => setValue('avatar', avatar)}
                    />
                </div>
            </div>
        </GorgiasChatRevampLayout>
    )
}
