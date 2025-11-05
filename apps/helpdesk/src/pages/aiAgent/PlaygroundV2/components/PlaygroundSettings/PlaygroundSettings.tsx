import React, { useCallback, useMemo } from 'react'

import { Button, ListItem, SelectField, ToggleField } from '@gorgias/axiom'

import { AIJourneySettings } from 'pages/aiAgent/PlaygroundV2/components/AIJourneySettings/AIJourneySettings'
import ChatAvailabilitySelection from 'pages/aiAgent/PlaygroundV2/components/ChatAvailabilitySelection/ChatAvailabilitySelection'
import { PlaygroundSegmentControl } from 'pages/aiAgent/PlaygroundV2/components/PlaygroundSegmentControl/PlaygroundSegmentControl'
import { TargetSelection } from 'pages/aiAgent/PlaygroundV2/components/TargetSelection/TargetSelection'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useEvents } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { useMessagesContext } from 'pages/aiAgent/PlaygroundV2/contexts/MessagesContext'
import { useSettingsContext } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import { useSettingsChanged } from 'pages/aiAgent/PlaygroundV2/hooks/useSettingsChanged'
import {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundCustomer,
    PlaygroundEvent,
} from 'pages/aiAgent/PlaygroundV2/types'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import css from './PlaygroundSettings.less'

const CHANNEL_OPTIONS: { id: PlaygroundChannels; label: string }[] = [
    {
        id: 'chat',
        label: 'Chat',
    },
    {
        id: 'email',
        label: 'Email',
    },
    {
        id: 'sms',
        label: 'SMS',
    },
]

const SEGMENTS: { value: 'inbound' | 'outbound'; label: string }[] = [
    { value: 'inbound', label: 'Inbound' },
    { value: 'outbound', label: 'Outbound' },
]

const InboundSettings: React.FC = () => {
    const {
        setSettings,
        chatAvailability,
        selectedCustomer,
        areActionsEnabled,
    } = useSettingsContext()

    const { setDraftMessage, setDraftSubject } = useMessagesContext()

    const { channel, onChannelChange } = useCoreContext()

    const selectedOption = useMemo(
        () => CHANNEL_OPTIONS.find((option) => option.id === channel),
        [channel],
    )

    const handleChannelUpdate = useCallback(
        (value: { id: PlaygroundChannels }) => {
            onChannelChange(value.id)
        },
        [onChannelChange],
    )

    const handleChatAvailabilityUpdate = useCallback(
        (value: PlaygroundChannelAvailability) => {
            setSettings({
                chatAvailability: value,
            })
        },
        [setSettings],
    )

    const handleUpdateCustomer = useCallback(
        ({
            customer,
            subject,
            message,
        }: {
            customer: PlaygroundCustomer
            subject?: string
            message?: string
        }) => {
            setSettings({
                selectedCustomer: customer,
            })
            if (subject) {
                setDraftSubject(subject)
            }
            if (message) {
                setDraftMessage(message)
            }
        },
        [setSettings, setDraftMessage, setDraftSubject],
    )

    const handleUpdateActions = useCallback(
        (value: boolean) => {
            setSettings({
                areActionsEnabled: value,
            })
        },
        [setSettings],
    )

    return (
        <>
            <SelectField
                value={selectedOption}
                onChange={handleChannelUpdate}
                items={CHANNEL_OPTIONS}
                isDisabled={false}
                label="Channel"
            >
                {(option: (typeof CHANNEL_OPTIONS)[number]) => (
                    <ListItem label={option.label} />
                )}
            </SelectField>
            {channel === 'chat' && (
                <ChatAvailabilitySelection
                    value={chatAvailability}
                    onChange={handleChatAvailabilityUpdate}
                />
            )}
            {selectedCustomer && (
                <TargetSelection
                    customer={selectedCustomer as PlaygroundCustomer}
                    onChange={handleUpdateCustomer}
                />
            )}
            <ToggleField
                value={areActionsEnabled}
                label="Actions"
                caption="Actions triggered in test mode will affect real customer data and can't be undone."
                onChange={handleUpdateActions}
            />
        </>
    )
}

const SettingsHeader = () => {
    const { setIsCollapsibleColumnOpen } = useCollapsibleColumn()

    return (
        <div className={css.settingsHeader}>
            <span>Test configuration</span>
            <Button
                icon="close"
                onClick={() => setIsCollapsibleColumnOpen(false)}
                aria-label="close playground panel"
                variant="tertiary"
                size="sm"
            />
        </div>
    )
}

const SettingsFooter = () => {
    const { hasChanged, resetInitialState } = useSettingsChanged()
    const { mode } = useSettingsContext()
    const { saveAIJourneySettings, isSavingJourneyData } = useAIJourneyContext()
    const { emit } = useEvents()

    const handleApply = useCallback(async () => {
        if (mode === 'outbound') {
            await saveAIJourneySettings()
        }
        emit(PlaygroundEvent.RESET_CONVERSATION)
        resetInitialState()
    }, [mode, saveAIJourneySettings, resetInitialState, emit])

    return (
        <div className={css.settingsFooter}>
            <Button
                isDisabled={!hasChanged}
                onClick={handleApply}
                isLoading={isSavingJourneyData}
            >
                {mode === 'inbound' ? 'Apply' : 'Save and Apply'}
            </Button>
        </div>
    )
}

export const PlaygroundSettings: React.FC = () => {
    const settings = useSettingsContext()

    return (
        <div className={css.playgroundSettings}>
            <SettingsHeader />
            <PlaygroundSegmentControl
                selectedValue={settings.mode}
                onValueChange={(value) =>
                    settings.setSettings({
                        mode: value as 'inbound' | 'outbound',
                    })
                }
                segments={SEGMENTS}
            />
            {settings.mode === 'outbound' ? (
                <AIJourneySettings />
            ) : (
                <InboundSettings />
            )}
            <SettingsFooter />
        </div>
    )
}
