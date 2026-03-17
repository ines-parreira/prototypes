import { Card, Elevation, Heading, Text } from '@gorgias/axiom'

import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'
import { ColorPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/ColorPicker'
import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'

import css from '../GorgiasChatIntegrationAppearance.less'

type Props = {
    mainColor: string
    headerPictureUrl?: string
    onMainColorChange: (value: string) => void
    onHeaderLogoUrlChange: (url?: string) => void
}

export const BrandCard = ({
    mainColor,
    headerPictureUrl,
    onMainColorChange,
    onHeaderLogoUrlChange,
}: Props) => {
    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Brand</Heading>
                    <Text size="md">
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
                            onChange={onMainColorChange}
                        />
                    </div>

                    <div className={css.fieldSection}>
                        <Text variant="bold" size="md">
                            Home page logo
                        </Text>
                        <Text size="sm" className={css.caption}>
                            Upload a horizontal logo (PNG, JPG, or GIF) with a
                            transparent background. This logo will appear in
                            your chat home screen.
                        </Text>
                        <LogoUpload
                            url={headerPictureUrl}
                            onChange={onHeaderLogoUrlChange}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
