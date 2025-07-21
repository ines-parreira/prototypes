import React from 'react'

import { useParams } from 'react-router-dom'

import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import deriveLabelFromIntegration from '../../../helpers/deriveLabelFromIntegration'
import integrationBelongsToChannel from '../../../helpers/integrationBelongsToChannel'
import { useStoreManagementState } from '../../../StoreManagementProvider'
import { ChannelWithMetadata } from '../../../types'

import css from './UnselectableItems.less'

interface UnselectableItemsProps {
    activeChannel: ChannelWithMetadata
}

const noop = () => {}

export default function UnselectableItems({
    activeChannel,
}: UnselectableItemsProps) {
    const { id: currentStoreId } = useParams<{ id: string }>()

    const { stores } = useStoreManagementState()
    return (
        <>
            {stores
                .filter((store) => store.store.id !== Number(currentStoreId))
                .flatMap((store) => {
                    return store.assignedChannels
                        .filter((integration) =>
                            integrationBelongsToChannel(
                                integration,
                                activeChannel.type,
                            ),
                        )
                        .map((channel) => (
                            <DropdownItem
                                isDisabled
                                key={channel.id}
                                option={{
                                    label: deriveLabelFromIntegration(channel),
                                    value: channel.id,
                                }}
                                onClick={noop}
                            >
                                <div className="d-flex flex-column">
                                    <span className={css.label}>
                                        {deriveLabelFromIntegration(channel)}
                                    </span>
                                    <span className={css.description}>
                                        Already used in another store
                                    </span>
                                </div>
                            </DropdownItem>
                        ))
                })}
        </>
    )
}
