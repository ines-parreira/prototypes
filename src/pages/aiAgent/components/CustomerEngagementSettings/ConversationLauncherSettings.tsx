import { useEffect, useState } from 'react'

import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

import { Button, Label } from '@gorgias/merchant-ui-kit'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { Drawer } from 'pages/common/components/Drawer'
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
import { usePotentialImpact } from './hooks/usePotentialImpact'

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
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label="Ask anything input"
            open={isOpen}
            portalRootId="app-root"
            onBackdropClick={onClose}
        >
            <Drawer.Header>
                Ask anything input
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-drawer"
                />
            </Drawer.Header>

            <Drawer.Content>
                <Label className={css.drawerToggleRow}>
                    <div className={css.desktopSwitch}>
                        Enable on Desktop only
                        <p className={css.desktopSwitchDescription}>
                            When enabled, the Ask anything input will only be
                            displayed on desktop.
                        </p>
                    </div>
                    <NewToggleButton
                        checked={localValue}
                        onChange={() => setLocalValue(!localValue)}
                        stopPropagation
                    />
                </Label>
            </Drawer.Content>

            <Drawer.Footer className={css.drawerFooter}>
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
            </Drawer.Footer>
        </Drawer>
    )
}

const ESTIMATED_INFLUENCED_GMV = 0.03

export const ConversationLauncherSettings = ({
    gmv,
    isGmvLoading,
}: {
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
}) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const { watch, setValue } = useFormContext()
    const isFloatingInputEnabled = watch('isFloatingInputEnabled')

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

    const { shopName } = useParams<{ shopName: string }>()

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

    const potentialImpact = usePotentialImpact(ESTIMATED_INFLUENCED_GMV, gmv)

    return (
        <>
            <ConversationLauncherAdvancedSettings
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <EngagementSettingsCard>
                <EngagementSettingsCardContentWrapper>
                    <EngagementSettingsCardImage
                        alt="image showing an example of the Ask anything input"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_floating_input.png',
                        )}
                    />

                    <EngagementSettingsCardContent>
                        <EngagementSettingsCardTitle>
                            Ask anything input
                        </EngagementSettingsCardTitle>

                        <EngagementSettingsCardDescription>
                            Drive more sales by adding an always-on input field
                            that encourages shoppers to start a conversation.
                        </EngagementSettingsCardDescription>

                        {storeConfiguration?.floatingChatInputConfiguration
                            ?.isEnabled ? (
                            <EngagementSettingsCardLinkButton
                                href={routes.analytics}
                                text="Track Performance"
                            />
                        ) : (
                            <EngagementSettingsCardImpact
                                icon="lock"
                                impact={potentialImpact}
                                isLoading={isGmvLoading}
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
