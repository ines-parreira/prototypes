import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

import { Box, Button, Label } from '@gorgias/merchant-ui-kit'

import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'
import { assetsUrl } from 'utils'
import { getLDClient } from 'utils/launchDarkly'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardFooter,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from './card/EngagementSettingsCard'
import { EngagementSettingsCardImpact } from './card/EngagementSettingsCardImpact'
import { EngagementSettingsCardLinkButton } from './card/EngagementSettingsCardLinkButton'
import { EngagementSettingsCardToggle } from './card/EngagementSettingsCardToggle'

import css from './ConversationLauncherSettings.less'

export const ConversationLauncherAdvancedSettings = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) => {
    const { watch, setValue } = useFormContext()
    const isFloatingInputDesktopOnly = watch('isFloatingInputDesktopOnly')
    const [localValue, setLocalValue] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setLocalValue(isFloatingInputDesktopOnly)
        }
    }, [isOpen, isFloatingInputDesktopOnly])

    const handleUpdate = () => {
        setValue('isFloatingInputDesktopOnly', localValue, {
            shouldDirty: true,
        })
        onClose()
    }

    return (
        <>
            <div
                className={classNames(css.drawerOverlay, {
                    [css.slideOut]: !isOpen,
                    [css.slideIn]: isOpen,
                })}
            />
            <div
                className={classNames(css.sidebar, {
                    [css.slideOut]: !isOpen,
                    [css.slideIn]: isOpen,
                })}
            >
                <Box className={css.sidebarHeader}>
                    <p className={css.sidebarTitle}>Ask Anything Input</p>
                    <i
                        className={classNames('material-icons', css.exitIcon)}
                        onClick={onClose}
                    >
                        keyboard_tab
                    </i>
                </Box>

                <Box className={css.sidebarBody}>
                    <Label className={css.sidebarToggleRow}>
                        <div className={css.desktopSwitch}>
                            Enable on Desktop only
                            <p className={css.desktopSwitchDescription}>
                                When enabled, the Ask Anything input will only
                                be displayed on desktop.
                            </p>
                        </div>
                        <NewToggleButton
                            checked={localValue}
                            onChange={() => setLocalValue(!localValue)}
                            stopPropagation
                        />
                    </Label>
                </Box>

                <div className={css.sidebarFooter}>
                    <Button
                        isDisabled={isFloatingInputDesktopOnly === localValue}
                        onClick={handleUpdate}
                        intent="primary"
                        type="submit"
                    >
                        Update
                    </Button>

                    <Button
                        isDisabled={false}
                        onClick={onClose}
                        intent="secondary"
                        size="medium"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    )
}

export const ConversationLauncherSettings = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const { watch, setValue } = useFormContext()
    const isFloatingInputEnabled = watch('isFloatingInputEnabled')

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

    const { shopName } = useParams<{ shopName: string }>()

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

    return (
        <>
            <ConversationLauncherAdvancedSettings
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <EngagementSettingsCard>
                <EngagementSettingsCardContentWrapper>
                    <EngagementSettingsCardImage
                        alt="image showing an example of the ask anything input"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_floating_input.png',
                        )}
                    />

                    <EngagementSettingsCardContent>
                        <EngagementSettingsCardTitle>
                            Ask Anything Input
                        </EngagementSettingsCardTitle>

                        <EngagementSettingsCardDescription>
                            Drive more sales by adding an always-on input field
                            that encourages shoppers to start a conversation.
                        </EngagementSettingsCardDescription>

                        {storeConfiguration?.floatingChatInputConfiguration
                            ?.isEnabled ? (
                            <EngagementSettingsCardLinkButton
                                href={routes.analytics}
                                icon="insights"
                                text="Track Performance"
                            />
                        ) : (
                            <EngagementSettingsCardImpact
                                icon="lock"
                                impact="Unlock up to ~5% additional GMV"
                            />
                        )}
                    </EngagementSettingsCardContent>

                    <EngagementSettingsCardToggle
                        isChecked={isFloatingInputEnabled}
                        onChange={() =>
                            setValue(
                                'isFloatingInputEnabled',
                                !isFloatingInputEnabled,
                                {
                                    shouldDirty: true,
                                },
                            )
                        }
                    />
                </EngagementSettingsCardContentWrapper>

                <EngagementSettingsCardFooter>
                    <SettingsFeatureRow
                        title="Advanced settings"
                        isDisabled={!isFloatingInputEnabled}
                        onClick={
                            isFloatingInputEnabled
                                ? () => setSidebarOpen(true)
                                : undefined
                        }
                    />
                </EngagementSettingsCardFooter>
            </EngagementSettingsCard>
        </>
    )
}
