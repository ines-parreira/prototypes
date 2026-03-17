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

import css from '../GorgiasChatIntegrationAppearance.less'

type Props = {
    name: string
    avatar: GorgiasChatAvatarSettings
    onNameChange: (value: string) => void
    onAvatarChange: (avatar: GorgiasChatAvatarSettings) => void
}

export const AvatarCard = ({
    name,
    avatar,
    onNameChange,
    onAvatarChange,
}: Props) => {
    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">
                        How your team appears to customers
                    </Heading>
                    <Text size="md">
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
                                onChange={(value) =>
                                    onAvatarChange({
                                        ...avatar,
                                        nameType:
                                            value as GorgiasChatAvatarNameType,
                                    })
                                }
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
                                    label="Custom"
                                />
                            </RadioGroup>
                        </div>
                        {avatar.nameType ===
                            GorgiasChatAvatarNameType.CHAT_TITLE && (
                            <div className={css.customNameInput}>
                                <TextField
                                    value={name}
                                    onChange={onNameChange}
                                />
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
                                onChange={(value) =>
                                    onAvatarChange({
                                        ...avatar,
                                        imageType:
                                            value as GorgiasChatAvatarImageType,
                                    })
                                }
                                flexDirection="column"
                                gap="xs"
                            >
                                <Radio
                                    value={
                                        GorgiasChatAvatarImageType.AGENT_PICTURE
                                    }
                                    label="Profile picture"
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
                            Avatar logo
                        </Text>
                        <Text size="sm" className={css.caption}>
                            Upload a logo to use as your team&apos;s or bot
                            avatar. Recommended size 100 × 100 px. Max 500 KB.
                        </Text>
                        <LogoUpload
                            url={avatar.companyLogoUrl}
                            onChange={(url) =>
                                onAvatarChange({
                                    ...avatar,
                                    companyLogoUrl: url,
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
