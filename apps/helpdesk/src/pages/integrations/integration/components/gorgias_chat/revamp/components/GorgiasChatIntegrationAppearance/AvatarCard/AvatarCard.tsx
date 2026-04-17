import {
    Card,
    Elevation,
    Heading,
    Radio,
    RadioGroup,
    Text,
    TextField,
} from '@gorgias/axiom'

import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import css from '../GorgiasChatIntegrationAppearance.less'

type Props = {
    name: string
    avatar: GorgiasChatAvatarSettings
    onAvatarChange: (avatar: GorgiasChatAvatarSettings) => void
}

export const AvatarCard = ({ name, avatar, onAvatarChange }: Props) => {
    const { updateAvatarSettings } = useChatPreviewPanelContext()

    const handleNameTypeChange = (value: string) => {
        onAvatarChange({
            ...avatar,
            nameType: value as GorgiasChatAvatarNameType,
        })
        updateAvatarSettings({
            avatar: {
                ...avatar,
                nameType: value as GorgiasChatAvatarNameType,
            },
        })
    }

    const handleCompanyLogoUrlChange = (url: string | undefined) => {
        onAvatarChange({
            ...avatar,
            companyLogoUrl: url,
        })
        updateAvatarSettings({
            avatar: {
                ...avatar,
                companyLogoUrl: url,
            },
        })
    }

    const handleImageTypeChange = (value: string) => {
        onAvatarChange({
            ...avatar,
            imageType: value as GorgiasChatAvatarImageType,
        })
        updateAvatarSettings({
            avatar: {
                ...avatar,
                imageType: value as GorgiasChatAvatarImageType,
            },
        })
    }

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">
                        How your team appears to shoppers
                    </Heading>
                    <Text size="md" className={css.cardDescription}>
                        Choose how your team&apos;s name and profile appear in
                        conversations.
                    </Text>
                </div>
                <div className={css.mainContent}>
                    <div className={css.fieldSection}>
                        <Text variant="bold" size="md">
                            Name
                        </Text>
                        <div className={css.radioGroupWrapper}>
                            <RadioGroup
                                value={avatar.nameType}
                                onChange={handleNameTypeChange}
                                flexDirection="column"
                                gap="xs"
                            >
                                <Radio
                                    value={
                                        GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                                    }
                                    label="First name only"
                                />
                                <Radio
                                    value={
                                        GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL
                                    }
                                    label="First name and last initial"
                                />
                                <Radio
                                    value={
                                        GorgiasChatAvatarNameType.AGENT_FULLNAME
                                    }
                                    label="Full name"
                                />
                                <Radio
                                    value={GorgiasChatAvatarNameType.CHAT_TITLE}
                                    label="Chat title"
                                />
                            </RadioGroup>
                        </div>
                        {avatar.nameType ===
                            GorgiasChatAvatarNameType.CHAT_TITLE && (
                            <div className={css.customNameInput}>
                                <TextField isDisabled value={name} />
                            </div>
                        )}
                    </div>

                    <div className={css.fieldSection}>
                        <Text variant="bold" size="md">
                            Profile picture
                        </Text>
                        <div className={css.radioGroupWrapper}>
                            <RadioGroup
                                value={avatar.imageType}
                                onChange={handleImageTypeChange}
                                flexDirection="column"
                                gap="xs"
                            >
                                <Radio
                                    value={
                                        GorgiasChatAvatarImageType.AGENT_PICTURE
                                    }
                                    label="Agent photo"
                                />
                                <Radio
                                    value={
                                        GorgiasChatAvatarImageType.AGENT_INITIALS
                                    }
                                    label="Initials"
                                />
                                <Radio
                                    value={
                                        GorgiasChatAvatarImageType.COMPANY_LOGO
                                    }
                                    label="Logo"
                                    isDisabled={!avatar.companyLogoUrl}
                                />
                            </RadioGroup>
                        </div>
                    </div>

                    <div className={css.fieldSection}>
                        <Text variant="bold" size="md">
                            Logo
                        </Text>
                        <Text size="sm" className={css.caption}>
                            This logo appears as your team&apos;s avatar in
                            chat. Recommended size 100 × 100 px. Max 500 KB.
                        </Text>
                        <LogoUpload
                            url={avatar.companyLogoUrl}
                            onChange={handleCompanyLogoUrlChange}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
