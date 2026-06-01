import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import {
    Card,
    Elevation,
    Heading,
    Icon,
    Radio,
    RadioGroup,
    Tag,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import type { GorgiasChatPosition } from 'models/integration/types'
import { GorgiasChatLauncherType } from 'models/integration/types'
import { LauncherPositionPicker } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/LauncherPositionPicker/LauncherPositionPicker'
import { LauncherPreview } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/LauncherPreview'
import type { GorgiasChatLauncherSettings } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/hooks/useAppearanceForm'

import css from '../../GorgiasChatIntegrationAppearance.less'
import launcherCss from './ChatLauncherCard.less'

const LABEL_MAX_LENGTH = 20

type Props = {
    launcher: GorgiasChatLauncherSettings
    mainColor: string
    position: GorgiasChatPosition
    largeChatEnabled: boolean
    onLauncherChange: (launcher: GorgiasChatLauncherSettings) => void
    onPositionChange: (position: GorgiasChatPosition) => void
    onLargeChatEnabledChange: (value: boolean) => void
}

const CHAT_SIZE_COMPACT = 'compact'
const CHAT_SIZE_EXPANDED = 'expanded'
type ChatSize = typeof CHAT_SIZE_COMPACT | typeof CHAT_SIZE_EXPANDED

export const ChatLauncherCard = ({
    launcher,
    mainColor,
    position,
    largeChatEnabled,
    onLauncherChange,
    onPositionChange,
    onLargeChatEnabledChange,
}: Props) => {
    const isIconAndLabel =
        launcher.type === GorgiasChatLauncherType.ICON_AND_LABEL
    const { value: isChatWindowSizeEnabled } = useFlagWithLoading(
        FeatureFlagKey.ChatTakesMoreRealEstate,
    )

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Layout</Heading>
                    <Text size="md" className={css.cardDescription}>
                        Customize how chat shows up on your site.
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
                                    onLauncherChange({
                                        ...launcher,
                                        type: GorgiasChatLauncherType.ICON,
                                    })
                                }
                            >
                                {launcher.type ===
                                    GorgiasChatLauncherType.ICON && (
                                    <span className={launcherCss.checkIcon}>
                                        <Icon
                                            name="check-circle"
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
                                    onLauncherChange({
                                        ...launcher,
                                        type: GorgiasChatLauncherType.ICON_AND_LABEL,
                                    })
                                }
                            >
                                {isIconAndLabel && (
                                    <span className={launcherCss.checkIcon}>
                                        <Icon
                                            name="check-circle"
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
                                        onLauncherChange({
                                            ...launcher,
                                            label: value,
                                        })
                                    }
                                    caption={`${launcher.label.length}/${LABEL_MAX_LENGTH} characters · Short labels work best`}
                                />
                            </div>
                        </div>
                    )}

                    <div className={css.fieldSection}>
                        <LauncherPositionPicker
                            value={position}
                            onChange={(position) => {
                                onPositionChange(position)
                            }}
                        />
                    </div>

                    {isChatWindowSizeEnabled && (
                        <div className={css.fieldSection}>
                            <div className={launcherCss.sectionHeader}>
                                <Text variant="bold" size="md">
                                    Chat window size
                                </Text>
                                <Text
                                    size="sm"
                                    className={launcherCss.sectionCaption}
                                >
                                    Choose how much space chat takes on desktop.
                                    On mobile, chat always opens full-screen.
                                </Text>
                            </div>
                            <div className={css.radioGroupWrapper}>
                                <RadioGroup
                                    value={
                                        largeChatEnabled
                                            ? CHAT_SIZE_EXPANDED
                                            : CHAT_SIZE_COMPACT
                                    }
                                    onChange={(value) =>
                                        onLargeChatEnabledChange(
                                            (value as ChatSize) ===
                                                CHAT_SIZE_EXPANDED,
                                        )
                                    }
                                    flexDirection="column"
                                    gap="xs"
                                >
                                    <div className={launcherCss.expandedOption}>
                                        <div
                                            className={
                                                launcherCss.expandedOptionRow
                                            }
                                        >
                                            <Radio
                                                value={CHAT_SIZE_EXPANDED}
                                                label="Expanded"
                                            />
                                            <Tooltip
                                                trigger={
                                                    <Tag
                                                        color="purple"
                                                        size="sm"
                                                    >
                                                        Recommended
                                                    </Tag>
                                                }
                                            >
                                                <TooltipContent>
                                                    Better for product discovery
                                                    and longer conversations.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Text
                                            size="sm"
                                            className={
                                                launcherCss.expandedOptionCaption
                                            }
                                        >
                                            More room for shoppers to browse
                                            products and stay in the
                                            conversation.
                                        </Text>
                                    </div>
                                    <Radio
                                        value={CHAT_SIZE_COMPACT}
                                        label="Compact"
                                        caption="A small floating window that stays out of the way of your site."
                                    />
                                </RadioGroup>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
