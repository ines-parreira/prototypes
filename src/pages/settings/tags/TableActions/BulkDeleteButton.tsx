import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

export const getPluralOrSingular = (
    count: number,
    singular: string,
    plural: string
) => (count > 1 ? plural : singular)

export enum MessageType {
    DEFAULT = 'default',
    TICKETS = 'tickets',
    HISTORY = 'history',
    PERMANENT = 'permanent',
    SAVED_FILTERS = 'saved-filters',
}

export type Props = {
    onBulkDelete: () => void
    selectedTagsCount: number
    selectedTagsText: string
}

const BulkDeleteButton = ({
    onBulkDelete,
    selectedTagsCount,
    selectedTagsText,
}: Props) => {
    const isAnalyticsSavedFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsSavedFilters]

    const getMessage = (messageType: MessageType) => {
        switch (messageType) {
            case MessageType.DEFAULT:
                return `You are about to delete ${selectedTagsCount} ${getPluralOrSingular(selectedTagsCount, 'tag', 'tags')}: ${selectedTagsText}.`
            case MessageType.TICKETS:
                return `${getPluralOrSingular(selectedTagsCount, 'It', 'They')} will be removed from all tickets.`
            case MessageType.HISTORY:
                return `Historical Statistics for ${getPluralOrSingular(selectedTagsCount, 'this tag', 'these tags')} will be lost.`
            case MessageType.PERMANENT:
                return `It will not be possible to add the ${getPluralOrSingular(selectedTagsCount, 'tag', 'tags')} back on the tickets they were on.`
            case MessageType.SAVED_FILTERS:
                return `The ${getPluralOrSingular(selectedTagsCount, 'tag', 'tags')} will have to be removed from Saved Filters manually.`
        }
    }

    return (
        <ConfirmationPopover
            buttonProps={{
                intent: 'destructive',
            }}
            content={
                <>
                    {getMessage(MessageType.DEFAULT)}
                    <br />
                    <b>
                        {getMessage(MessageType.TICKETS)}
                        <br />
                        {getMessage(MessageType.HISTORY)}
                        <br />
                        {getMessage(MessageType.PERMANENT)}
                        <br />
                        {isAnalyticsSavedFilters && (
                            <>
                                <br />
                                {getMessage(MessageType.SAVED_FILTERS)}
                            </>
                        )}
                    </b>
                </>
            }
            onConfirm={onBulkDelete}
        >
            {({uid, onDisplayConfirmation}) => (
                <Button
                    isDisabled={!selectedTagsCount}
                    id={uid}
                    intent="secondary"
                    className="mr-2 skip-default"
                    onClick={onDisplayConfirmation}
                    leadingIcon="delete"
                >
                    Delete
                </Button>
            )}
        </ConfirmationPopover>
    )
}

export default BulkDeleteButton
