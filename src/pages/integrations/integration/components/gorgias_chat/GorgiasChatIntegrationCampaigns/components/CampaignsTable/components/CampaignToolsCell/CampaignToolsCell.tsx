import React, {MouseEvent, useCallback} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import {ChatCampaign} from '../../../../types/Campaign'

type Props = {
    campaign: ChatCampaign
    onClickDelete: (campaign: ChatCampaign) => void
    onClickDuplicate: (event: MouseEvent, campaign: ChatCampaign) => void
}

export const CampaignToolsCell = ({
    campaign,
    onClickDelete,
    onClickDuplicate,
}: Props) => {
    const renderConfirmation = useCallback(({uid, onDisplayConfirmation}) => {
        return (
            <IconButton
                className="mr-1"
                onClick={onDisplayConfirmation}
                fillStyle="ghost"
                intent="destructive"
                title="Delete campaign"
                id={uid}
                data-testid="delete-icon-button"
            >
                delete
            </IconButton>
        )
    }, [])

    return (
        <>
            <IconButton
                className="mr-1"
                data-testid="duplicate-icon-button"
                fillStyle="ghost"
                intent="secondary"
                title="Duplicate campaign"
                onClick={(ev) => onClickDuplicate(ev, campaign)}
            >
                file_copy
            </IconButton>
            <ConfirmationPopover
                buttonProps={{
                    intent: 'destructive',
                }}
                content={
                    <>
                        You are about to delete <b>{campaign.name}</b> campaign.
                    </>
                }
                id={`delete-campaign-${campaign.id}`}
                onConfirm={() => onClickDelete(campaign)}
            >
                {renderConfirmation}
            </ConfirmationPopover>
        </>
    )
}
