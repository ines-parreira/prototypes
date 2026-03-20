import { Card, Elevation, Heading, Icon, Text, TextField } from '@gorgias/axiom'

import type { GorgiasChatPosition } from 'models/integration/types'
import { GorgiasChatLauncherType } from 'models/integration/types'
import { LauncherPreview } from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationAppearance/revamp/components/LauncherPreview'
import { useGorgiasChatCreationWizardContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { LauncherPositionPicker } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/LauncherPositionPicker/LauncherPositionPicker'
import type { GorgiasChatLauncherSettings } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useAppearanceForm'

import css from '../GorgiasChatIntegrationAppearance.less'
import launcherCss from './ChatLauncherCard.less'

const LABEL_MAX_LENGTH = 20

type Props = {
    launcher: GorgiasChatLauncherSettings
    mainColor: string
    position: GorgiasChatPosition
    onLauncherChange: (launcher: GorgiasChatLauncherSettings) => void
    onPositionChange: (position: GorgiasChatPosition) => void
}

export const ChatLauncherCard = ({
    launcher,
    mainColor,
    position,
    onLauncherChange,
    onPositionChange,
}: Props) => {
    const isIconAndLabel =
        launcher.type === GorgiasChatLauncherType.ICON_AND_LABEL

    const { closeChat, updatePosition, updateLauncher, updateTexts } =
        useGorgiasChatCreationWizardContext()

    const handleLauncherChange = (settings: GorgiasChatLauncherSettings) => {
        onLauncherChange(settings)
        updateLauncher(settings)
        updateTexts({ chatWithUs: settings.label })
    }

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Chat launcher</Heading>
                    <Text size="md">
                        Customize how the chat launcher appears on your website.
                    </Text>
                </div>

                <div className={css.launcherMainContent}>
                    <div className={css.fieldSection}>
                        <Text variant="bold" size="md">
                            Launcher appearance
                        </Text>
                        <div className={launcherCss.typeOptions}>
                            <button
                                type="button"
                                className={`${launcherCss.typeOption} ${launcher.type === GorgiasChatLauncherType.ICON ? launcherCss.typeOptionSelected : ''}`}
                                onClick={() =>
                                    handleLauncherChange({
                                        ...launcher,
                                        type: GorgiasChatLauncherType.ICON,
                                    })
                                }
                            >
                                {launcher.type ===
                                    GorgiasChatLauncherType.ICON && (
                                    <span className={launcherCss.checkIcon}>
                                        <Icon
                                            name="circle-check"
                                            color="var(--content-accent-default)"
                                        />
                                    </span>
                                )}
                                <Text variant="bold" size="md">
                                    Icon only
                                </Text>
                                <div className={launcherCss.launcherPreview}>
                                    <LauncherPreview fillColor={mainColor} />
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`${launcherCss.typeOption} ${isIconAndLabel ? launcherCss.typeOptionSelected : ''}`}
                                onClick={() =>
                                    handleLauncherChange({
                                        ...launcher,
                                        type: GorgiasChatLauncherType.ICON_AND_LABEL,
                                    })
                                }
                            >
                                {isIconAndLabel && (
                                    <span className={launcherCss.checkIcon}>
                                        <Icon
                                            name="circle-check"
                                            color="var(--content-accent-default)"
                                        />
                                    </span>
                                )}
                                <Text variant="bold" size="md">
                                    Icon and label
                                </Text>
                                <div className={launcherCss.launcherPreview}>
                                    <LauncherPreview
                                        fillColor={mainColor}
                                        label={launcher.label || 'Chat with us'}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>

                    {isIconAndLabel && (
                        <div className={css.fieldSection}>
                            <div className={launcherCss.labelInput}>
                                <TextField
                                    label="Label"
                                    isRequired
                                    value={launcher.label}
                                    maxLength={LABEL_MAX_LENGTH}
                                    onChange={(value) =>
                                        handleLauncherChange({
                                            ...launcher,
                                            label: value,
                                        })
                                    }
                                    onFocus={closeChat}
                                    caption={`${launcher.label.length}/${LABEL_MAX_LENGTH} characters · Short labels work best`}
                                />
                            </div>
                        </div>
                    )}

                    <div className={css.fieldSection}>
                        <span onFocus={closeChat}>
                            <LauncherPositionPicker
                                value={position}
                                onChange={(position) => {
                                    onPositionChange(position)
                                    updatePosition(position)
                                }}
                            />
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    )
}
