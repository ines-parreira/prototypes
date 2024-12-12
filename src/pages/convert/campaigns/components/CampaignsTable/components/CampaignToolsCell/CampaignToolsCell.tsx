import {Map} from 'immutable'
import React, {MouseEvent, useCallback, useMemo, useState} from 'react'

import useLocalStorage from 'hooks/useLocalStorage'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import LightCampaignModal from 'pages/convert/campaigns/components/LightCampaignModal/LightCampaignModal'
import {LightCampaignModalType} from 'pages/convert/campaigns/types/enums/LightCampaignModalType'
import {chatIsShopifyStore} from 'pages/convert/campaigns/utils/chatIsShopifyStore'

import {Campaign} from '../../../../types/Campaign'

type Props = {
    campaign: Campaign
    integration: Map<any, any>
    createDisabled: boolean
    isDeletingCampaign: boolean
    isOverCampaignsLimit: boolean
    onClickDelete: (campaign: Campaign) => void
    onClickDuplicate: (event: MouseEvent, campaign: Campaign) => void
    onClickEdit: (event: MouseEvent) => void
}

export const CampaignToolsCell = ({
    campaign,
    integration,
    createDisabled,
    isDeletingCampaign,
    isOverCampaignsLimit,
    onClickDelete,
    onClickDuplicate,
    onClickEdit,
}: Props) => {
    const [isLightModalOpen, setIsLightModalOpen] = useState(false)

    const storageKey = useMemo(() => {
        return `convert:lightModal:${integration.get('id') as string}:${
            LightCampaignModalType.DeleteCampaign
        }`
    }, [integration])
    const [lightModalDismissed, setLightModalDismissed] = useLocalStorage(
        storageKey,
        false
    )

    const isLight = campaign.is_light
    const isShopifyStore = chatIsShopifyStore(integration)

    const onDelete = useCallback(
        (campaign) => {
            onClickDelete(campaign)
            setIsLightModalOpen(false)
        },
        [onClickDelete]
    )

    const renderConfirmation = useCallback(({uid, onDisplayConfirmation}) => {
        return (
            <IconButton
                className="mr-1"
                onClick={onDisplayConfirmation}
                fillStyle="ghost"
                intent="destructive"
                title="Delete campaign"
                aria-label="Delete campaign"
                id={uid}
                data-testid="delete-icon-button" // used in e2e tests
            >
                delete
            </IconButton>
        )
    }, [])

    const duplicateButton = useMemo(() => {
        return (
            <IconButton
                className="mr-1"
                fillStyle="ghost"
                intent="secondary"
                title="Duplicate campaign"
                aria-label="Duplicate campaign"
                onClick={(ev) => onClickDuplicate(ev, campaign)}
            >
                file_copy
            </IconButton>
        )
    }, [campaign, onClickDuplicate])

    const deleteButton = useMemo(() => {
        return (
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
        )
    }, [campaign, onClickDelete, renderConfirmation])

    const deleteButtonWithLightModal = useMemo(() => {
        return (
            <>
                <IconButton
                    className="mr-1"
                    onClick={() => setIsLightModalOpen(true)}
                    fillStyle="ghost"
                    intent="destructive"
                    title="Delete campaign"
                    aria-label="Delete campaign"
                    data-testid="delete-icon-button" // used in e2e tests
                >
                    delete
                </IconButton>
                <LightCampaignModal
                    modalType={LightCampaignModalType.DeleteCampaign}
                    isOpen={isLightModalOpen}
                    isDismissed={!!lightModalDismissed}
                    setIsDismissed={setLightModalDismissed}
                    isSubmitting={isDeletingCampaign}
                    onSubmit={() => onDelete(campaign)}
                    onClose={() => setIsLightModalOpen(false)}
                />
            </>
        )
    }, [
        campaign,
        isDeletingCampaign,
        isLightModalOpen,
        lightModalDismissed,
        onDelete,
        setLightModalDismissed,
    ])

    const editButton = useMemo(() => {
        return (
            <IconButton
                className="mr-0 ml-auto"
                fillStyle="ghost"
                intent="secondary"
                title="Edit campaign"
                aria-label="Edit campaign"
                onClick={(ev) => onClickEdit(ev)}
            >
                edit
            </IconButton>
        )
    }, [onClickEdit])

    return (
        <>
            {!isLight && (
                <>
                    {createDisabled ? editButton : duplicateButton}
                    {isOverCampaignsLimit && !lightModalDismissed
                        ? deleteButtonWithLightModal
                        : deleteButton}
                </>
            )}
            {isLight && (
                <>
                    {!isShopifyStore && duplicateButton}
                    {editButton}
                </>
            )}
        </>
    )
}
