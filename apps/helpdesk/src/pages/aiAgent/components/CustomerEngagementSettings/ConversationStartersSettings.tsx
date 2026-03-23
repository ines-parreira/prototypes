import { useCallback, useEffect, useRef, useState } from 'react'

import classNames from 'classnames'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

import { Button, CheckBoxField, Label, ToggleField } from '@gorgias/axiom'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { Drawer } from 'pages/common/components/Drawer'
import { STATS_ROUTES } from 'routes/constants'
import { assetsUrl } from 'utils'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from './card/EngagementSettingsCard'
import { EngagementSettingsCardImpact } from './card/EngagementSettingsCardImpact'
import { EngagementSettingsCardLinkButton } from './card/EngagementSettingsCardLinkButton'
import { EngagementSettingsCardToggle } from './card/EngagementSettingsCardToggle'
import { usePotentialImpact } from './hooks/usePotentialImpact'

import css from './ConversationStartersSettings.less'

export const ConversationStartersAdvancedSettings = ({
    isOpen,
    onClose,
    onSave,
}: {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
}) => {
    const { watch, setValue } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')
    const isConversationStartersDesktopOnly = watch(
        'isConversationStartersDesktopOnly',
    )

    const wasOpenRef = useRef(false)

    const [localValue, setLocalValue] = useState({
        isConversationStartersEnabled: false,
        isConversationStartersDesktopOnly: false,
    })

    const handleUpdate = useCallback(() => {
        setValue(
            'isConversationStartersEnabled',
            localValue.isConversationStartersEnabled,
            { shouldDirty: true },
        )
        setValue(
            'isConversationStartersDesktopOnly',
            localValue.isConversationStartersDesktopOnly,
            { shouldDirty: true },
        )
        onSave()
    }, [localValue, setValue, onSave])

    const handleOnChange = useCallback(() => {
        setLocalValue((prev) => ({
            ...prev,
            isConversationStartersEnabled: !prev.isConversationStartersEnabled,
            isConversationStartersDesktopOnly:
                prev.isConversationStartersEnabled
                    ? false
                    : prev.isConversationStartersDesktopOnly,
        }))
    }, [setLocalValue])

    const handleHideOnMobileChange = useCallback(() => {
        setLocalValue((prev) => ({
            ...prev,
            isConversationStartersDesktopOnly:
                !prev.isConversationStartersDesktopOnly,
            isConversationStartersEnabled:
                !prev.isConversationStartersDesktopOnly
                    ? true
                    : prev.isConversationStartersEnabled,
        }))
    }, [setLocalValue])

    useEffect(() => {
        if (isOpen && !wasOpenRef.current) {
            setLocalValue({
                isConversationStartersEnabled,
                isConversationStartersDesktopOnly,
            })
        }
        wasOpenRef.current = isOpen
    }, [
        isOpen,
        isConversationStartersEnabled,
        isConversationStartersDesktopOnly,
    ])

    return (
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label="AI FAQs: Floating above chat"
            open={isOpen}
            portalRootId="app-root"
            onBackdropClick={onClose}
        >
            <Drawer.Header>
                AI FAQs: Floating above chat
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-drawer"
                />
            </Drawer.Header>

            <Drawer.Content>
                <Label
                    className={classNames(
                        css.drawerToggleRow,
                        css.desktopToggleRow,
                    )}
                >
                    <div className={css.toggleContainer}>
                        <div className={css.allDevicesSwitch}>
                            Enable AI FAQs
                        </div>
                        <ToggleField
                            value={localValue.isConversationStartersEnabled}
                            onChange={handleOnChange}
                        />
                    </div>
                    <span className={css.switchDescription}>
                        Show up to 3 AI-generated questions above chat to answer
                        common shopper questions and start conversations.
                    </span>
                    <CheckBoxField
                        label="Hide on mobile"
                        value={localValue.isConversationStartersDesktopOnly}
                        onChange={handleHideOnMobileChange}
                    />
                </Label>
            </Drawer.Content>

            <Drawer.Footer className={css.drawerFooter}>
                <Button
                    isDisabled={
                        isConversationStartersEnabled ===
                            localValue.isConversationStartersEnabled &&
                        isConversationStartersDesktopOnly ===
                            localValue.isConversationStartersDesktopOnly
                    }
                    onClick={handleUpdate}
                    type="submit"
                >
                    Update
                </Button>

                <Button onClick={onClose} variant="secondary" size="md">
                    Cancel
                </Button>
            </Drawer.Footer>
        </Drawer>
    )
}

export const CONV_STARTERS_ESTIMATED_INFLUENCED_GMV = 0.17

type Props = {
    description?: string
    isEnabled: boolean
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
    onAdvancedSettingsSave?: () => void
}

export const ConversationStartersSettings = ({
    description = 'Show up to 3 AI-generated questions above chat to answer common shopper questions and start conversations.',
    isEnabled,
    gmv,
    isGmvLoading,
    onAdvancedSettingsSave,
}: Props) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const { watch } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')
    const isConversationStartersDesktopOnly = watch(
        'isConversationStartersDesktopOnly',
    )
    const { shopName } = useParams<{ shopName: string }>()

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const potentialImpact = usePotentialImpact(
        CONV_STARTERS_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleAdvancedSettingsSave = useCallback(() => {
        onAdvancedSettingsSave?.()
        setSidebarOpen(false)
    }, [onAdvancedSettingsSave])

    const handleEngagementSettingsChange = useCallback(
        () => setSidebarOpen(true),
        [setSidebarOpen],
    )

    return (
        <>
            <ConversationStartersAdvancedSettings
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onSave={handleAdvancedSettingsSave}
            />

            <EngagementSettingsCard>
                <EngagementSettingsCardContentWrapper>
                    <EngagementSettingsCardImage
                        alt="image showing an example of the conversation starters"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_conversation_starters_small.png',
                        )}
                    />

                    <EngagementSettingsCardContent className={css.cardContent}>
                        <div className={css.cardHeader}>
                            <EngagementSettingsCardTitle>
                                AI FAQs: Floating above chat
                            </EngagementSettingsCardTitle>
                            {!storeConfiguration?.isConversationStartersEnabled && (
                                <EngagementSettingsCardImpact
                                    icon="lock"
                                    impact={potentialImpact}
                                    isLoading={isGmvLoading}
                                    isChecked
                                />
                            )}

                            <EngagementSettingsCardToggle
                                isChecked={isConversationStartersEnabled}
                                isDisabled={!isEnabled}
                                onChange={handleEngagementSettingsChange}
                                onSettingsClick={() => setSidebarOpen(true)}
                                isDesktopOnly={
                                    isConversationStartersDesktopOnly
                                }
                                withBadges
                            />
                        </div>

                        <EngagementSettingsCardDescription>
                            {description}
                        </EngagementSettingsCardDescription>

                        {storeConfiguration?.isConversationStartersEnabled && (
                            <EngagementSettingsCardLinkButton
                                href={`/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}/${shopName}`}
                                text="Track Performance"
                            />
                        )}
                    </EngagementSettingsCardContent>
                </EngagementSettingsCardContentWrapper>
            </EngagementSettingsCard>
        </>
    )
}
