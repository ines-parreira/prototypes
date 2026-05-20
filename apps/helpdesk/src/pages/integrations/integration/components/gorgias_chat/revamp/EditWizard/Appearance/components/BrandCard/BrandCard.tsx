import {
    Card,
    CardContent,
    CardHeader,
    Elevation,
    Heading,
    Text,
} from '@gorgias/axiom'

import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'
import { ColorPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/ColorPicker'
import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import css from '../../GorgiasChatIntegrationAppearance.less'

type Props = {
    mainColor: string
    headerPictureUrl?: string
    headerAlternativePictureUrl?: string
    onMainColorChange: (value: string) => void
    onHeaderLogoUrlChange: (url?: string) => void
    onHeaderAlternativePictureUrlChange: (url?: string) => void
}

export const BrandCard = ({
    mainColor,
    headerPictureUrl,
    headerAlternativePictureUrl,
    onMainColorChange,
    onHeaderLogoUrlChange,
    onHeaderAlternativePictureUrlChange,
}: Props) => {
    const {
        updateMainColor,
        updateHeaderPictureUrl,
        updateHeaderAlternativePictureUrl,
        openChat,
    } = useChatPreviewPanelContext()

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Brand</Heading>
                    <Text size="md" className={css.cardDescription}>
                        Customize your chat to match your store&apos;s look and
                        feel.
                    </Text>
                </div>
                <div className={css.mainContent}>
                    <div className={css.fieldSection}>
                        <Text variant="bold" size="md">
                            Brand color
                        </Text>
                        <Text size="sm" className={css.caption}>
                            Select your brand color to personalize the chat
                            experience.
                        </Text>
                        <ColorPicker
                            className={css.brandColorPicker}
                            value={mainColor}
                            defaultValue={GORGIAS_CHAT_DEFAULT_COLOR}
                            onChange={(value) => {
                                onMainColorChange(value)
                                updateMainColor(value)
                            }}
                            onFocus={openChat}
                        />
                    </div>

                    <div className={css.fieldSection}>
                        <Text variant="bold" size="md">
                            Home page logo
                        </Text>
                        <Text size="sm" className={css.caption}>
                            Upload a horizontal logo (PNG, JPG, or GIF) with a
                            transparent background. You only need an alternative
                            logo if your default isn&apos;t visible on white
                            backgrounds.
                        </Text>
                        <div className={css.logoUploadsContainer}>
                            <Card className={css.logoUploadCard}>
                                <CardHeader
                                    title="Default logo"
                                    description="Works on your brand color"
                                />
                                <CardContent>
                                    <LogoUpload
                                        url={headerPictureUrl}
                                        onChange={(url) => {
                                            onHeaderLogoUrlChange(url)
                                            updateHeaderPictureUrl(url)
                                        }}
                                    />
                                </CardContent>
                            </Card>

                            <Card className={css.logoUploadCard}>
                                <CardHeader
                                    title="Alternative logo"
                                    description="Works on white backgrounds"
                                />
                                <CardContent>
                                    <LogoUpload
                                        url={headerAlternativePictureUrl}
                                        onChange={(url) => {
                                            onHeaderAlternativePictureUrlChange(
                                                url,
                                            )
                                            updateHeaderAlternativePictureUrl(
                                                url,
                                            )
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
