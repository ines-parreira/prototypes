import { useCallback } from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CheckBoxField,
    Elevation,
    Heading,
    Icon,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import {
    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH,
    GORGIAS_CHAT_DEFAULT_COLOR,
} from 'config/integrations/gorgias_chat'
import { ColorPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/ColorPicker'
import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import css from '../../GorgiasChatIntegrationAppearance.less'

type Props = {
    mainColor: string
    conversationColor: string
    useMainColorOutsideBusinessHours: boolean
    headerPictureUrl?: string
    headerAlternativePictureUrl?: string
    introductionText: string
    offlineIntroductionText: string
    isAiAgentEnabled?: boolean
    showAdvancedColors?: boolean
    onMainColorChange: (value: string) => void
    onConversationColorChange: (value: string) => void
    onUseMainColorOutsideBusinessHoursChange: (value: boolean) => void
    onHeaderLogoUrlChange: (url?: string) => void
    onHeaderAlternativePictureUrlChange: (url?: string) => void
    onIntroductionTextChange: (value: string) => void
    onOfflineIntroductionTextChange: (value: string) => void
}

export const BrandCard = ({
    mainColor,
    conversationColor,
    useMainColorOutsideBusinessHours,
    headerPictureUrl,
    headerAlternativePictureUrl,
    introductionText,
    offlineIntroductionText,
    isAiAgentEnabled = false,
    showAdvancedColors = false,
    onMainColorChange,
    onConversationColorChange,
    onUseMainColorOutsideBusinessHoursChange,
    onHeaderLogoUrlChange,
    onHeaderAlternativePictureUrlChange,
    onIntroductionTextChange,
    onOfflineIntroductionTextChange,
}: Props) => {
    const {
        updateMainColor,
        updateConversationColor,
        updateHeaderPictureUrl,
        updateHeaderAlternativePictureUrl,
        updateIntroductionText,
        updateOfflineIntroductionText,
        openChat,
        displayPage,
    } = useChatPreviewPanelContext()

    const showGreetingPreview = useCallback(() => {
        displayPage('homepage')
        openChat()
    }, [displayPage, openChat])

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
                    {showAdvancedColors ? (
                        <div className={css.fieldSection}>
                            <div className={css.colorPickersWrapper}>
                                <div className={css.colorPickerField}>
                                    <Text variant="bold" size="md">
                                        Main color
                                    </Text>
                                    <ColorPicker
                                        value={mainColor}
                                        defaultValue={
                                            GORGIAS_CHAT_DEFAULT_COLOR
                                        }
                                        onChange={(value) => {
                                            onMainColorChange(value)
                                            updateMainColor(value)
                                        }}
                                        onFocus={openChat}
                                    />
                                </div>
                                <div className={css.colorPickerField}>
                                    <Text variant="bold" size="md">
                                        Conversation color
                                    </Text>
                                    <ColorPicker
                                        value={conversationColor}
                                        defaultValue={
                                            GORGIAS_CHAT_DEFAULT_COLOR
                                        }
                                        onChange={(value) => {
                                            onConversationColorChange(value)
                                            updateConversationColor(value)
                                        }}
                                        onFocus={openChat}
                                    />
                                </div>
                            </div>
                            <div className={css.outsideBusinessHoursRow}>
                                <CheckBoxField
                                    label="Keep main color when outside business hours"
                                    value={useMainColorOutsideBusinessHours}
                                    onChange={
                                        onUseMainColorOutsideBusinessHoursChange
                                    }
                                />
                                <Tooltip
                                    trigger={
                                        <span
                                            className={
                                                css.outsideBusinessHoursTooltipTrigger
                                            }
                                            aria-label="More information about keeping main color outside business hours"
                                        >
                                            <Icon name="help-circle" />
                                        </span>
                                    }
                                >
                                    <TooltipContent title="When unselected, the Chat will turn gray when outside business hours." />
                                </Tooltip>
                            </div>
                        </div>
                    ) : (
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
                                    onConversationColorChange(value)
                                    updateMainColor(value)
                                }}
                                onFocus={openChat}
                            />
                        </div>
                    )}

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

                    {!isAiAgentEnabled && (
                        <div className={css.fieldSection}>
                            <Text variant="bold" size="md">
                                Greeting
                            </Text>
                            <Text size="sm" className={css.caption}>
                                Set a greeting when customers open the chat ·{' '}
                                {
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }{' '}
                                characters max
                            </Text>
                            <TextField
                                label="During business hours"
                                value={introductionText}
                                maxLength={
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }
                                onChange={(value) => {
                                    onIntroductionTextChange(value)
                                    updateIntroductionText(value)
                                }}
                                onFocus={showGreetingPreview}
                            />
                            <TextField
                                label="Outside business hours"
                                value={offlineIntroductionText}
                                maxLength={
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }
                                onChange={(value) => {
                                    onOfflineIntroductionTextChange(value)
                                    updateOfflineIntroductionText(value)
                                }}
                                onFocus={showGreetingPreview}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
