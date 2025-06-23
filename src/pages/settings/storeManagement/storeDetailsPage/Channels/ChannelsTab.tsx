import React, { useMemo, useRef } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    useCreateStoreMapping,
    useDeleteStoreMapping,
} from 'models/storeMapping/queries'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import { useStoreManagementState } from '../../StoreManagementProvider'
import ChannelsDrawer from './ChannelsDrawer/ChannelsDrawer'
import useActiveChannel from './hooks/useActiveChannel'
import { useChannels } from './hooks/useChannels'
import { useNotifications } from './hooks/useNotifications'

import css from '../StoreDetailsPage.less'

interface ChannelsTabProps {
    storeId: string
}

export default function ChannelsTab({ storeId }: ChannelsTabProps) {
    const allChannels = useChannels()
    const includedChannelTypes = useFlag<string[]>(
        FeatureFlagKey.MultiStoreIncludedChannels,
        [],
    )
    const channels = useMemo(
        () =>
            allChannels.filter((channel) =>
                includedChannelTypes.includes(channel.type),
            ),
        [allChannels, includedChannelTypes],
    )
    const { refetchMapping } = useStoreManagementState()
    const { mutateAsync: createMapping } = useCreateStoreMapping()
    const { mutateAsync: deleteMapping } = useDeleteStoreMapping()
    const { handleMappingResults } = useNotifications(channels)

    const { activeChannel, setActiveChannelType, reset, changes, setChanges } =
        useActiveChannel(channels)

    const promptRef = useRef<{ onLeaveContext: () => void }>(null)

    const onCloseDrawer = () => {
        if (changes.length > 0) {
            promptRef.current?.onLeaveContext()
            return
        }
        reset()
    }
    const onSaveDrawer = async () => {
        const errors: { channelId: number }[] = []
        await Promise.allSettled(
            changes.map(async (change) => {
                try {
                    if (change.action === 'add') {
                        await createMapping([
                            {
                                store_id: Number(storeId),
                                integration_id: change.channelId,
                            },
                        ])
                    } else {
                        await deleteMapping([change.channelId])
                    }
                } catch {
                    errors.push({
                        channelId: change.channelId,
                    })
                }
            }),
        )
        handleMappingResults(errors, changes)
        refetchMapping()
        reset()
    }

    return (
        <section className={css.detailsContainer}>
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
                                setActiveChannelType(channel.type)
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
