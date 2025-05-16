import React, { useRef } from 'react'

import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import ChannelsDrawer from './ChannelsDrawer/ChannelsDrawer'
import useActiveChannel from './hooks/useActiveChannel'
import { useChannels } from './hooks/useChannels'

import css from '../StoreDetailsPage.less'

export default function ChannelsTab() {
    const { channels } = useChannels()
    const { activeChannel, setActiveChannel, reset, changes, setChanges } =
        useActiveChannel()

    const promptRef = useRef<{ onLeaveContext: () => void }>(null)

    const onCloseDrawer = () => {
        if (changes.length > 0) {
            promptRef.current?.onLeaveContext()
            return
        }
        reset()
    }
    const onSaveDrawer = () => {
        reset()
    }

    return (
        <section className={css.channelsContainer}>
            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle>Channels</SettingsCardTitle>
                    <p>View and manage your channels for this store.</p>
                </SettingsCardHeader>
                <SettingsCardContent>
                    {channels.map((channel) => (
                        <SettingsFeatureRow
                            key={channel.title}
                            title={channel.title}
                            description={channel.description}
                            badgeText={`${channel.count || 'None'} Assigned`}
                            nbFeatures={channel.count}
                            onClick={() => {
                                setActiveChannel(channel)
                            }}
                        />
                    ))}
                </SettingsCardContent>
            </SettingsCard>
            {activeChannel && (
                <ChannelsDrawer
                    activeChannel={activeChannel}
                    changes={changes}
                    setChanges={setChanges}
                    onCloseDrawer={onCloseDrawer}
                    onSaveDrawer={onSaveDrawer}
                />
            )}
            <UnsavedChangesPrompt
                ref={promptRef}
                onDiscard={reset}
                shouldShowSaveButton
                shouldShowDiscardButton
                onSave={onSaveDrawer}
                when={!!changes.length}
            />
        </section>
    )
}
