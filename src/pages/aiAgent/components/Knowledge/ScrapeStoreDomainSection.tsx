import React from 'react'

import { Button, IconButton, Label, Tooltip } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useId from 'hooks/useId'
import {
    HeaderType,
    IngestionLogStatus,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import SyncDomainConfirmationModal from 'pages/aiAgent/AiAgentScrapedDomainContent/SyncDomainConfirmationModal'
import {
    getFormattedSyncDate,
    getFormattedSyncDatetime,
    getNextSyncDate,
    isSyncLessThan24Hours,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/utils'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { usePollStoreDomainIngestionLog } from 'pages/aiAgent/hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from 'pages/aiAgent/hooks/useSyncStoreDomain'
import ItemWithTooltip from 'pages/common/components/ItemWithTooltip/ItemWithTooltip'
import history from 'pages/history'

import css from './ScrapeStoreDomainSection.less'

type Props = {
    shopName: string
    helpCenterId: number
    syncStoreDomainStatus: string | null
    onStatusChange: (status: string | null) => void
}

export const ScrapeStoreDomainSection = ({
    shopName,
    helpCenterId,
    syncStoreDomainStatus,
    onStatusChange,
}: Props) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`
    const syncButtonId = `syncButton-${id}`
    const isAiAgentFilesAndUrlsKnowledgeVisible = useFlag(
        FeatureFlagKey.AiAgentFilesAndUrlsKnowledgeVisibilityButton,
    )

    const { routes } = useAiAgentNavigation({ shopName })
    const onManage = () => {
        history.push(routes.pagesContent)
    }

    const {
        storeDomain,
        storeUrl,
        storeDomainIngestionLog,
        isFetchLoading,
        syncTriggered,
        handleTriggerSync,
        handleOnSync,
        handleOnCancel,
    } = useSyncStoreDomain({ helpCenterId, shopName, onStatusChange })

    const { syncIsPending } = usePollStoreDomainIngestionLog({
        helpCenterId,
        shopName,
        storeUrl,
        onStatusChange,
    })

    const isSyncPending =
        syncStoreDomainStatus === IngestionLogStatus.Pending || syncIsPending

    const latestSync = storeDomainIngestionLog?.latest_sync
    const syncDateString = getFormattedSyncDate(latestSync)
    const syncDateTimeString = getFormattedSyncDatetime(latestSync)
    const isSyncLessThan24h = isSyncLessThan24Hours(latestSync)
    const nextSyncDate = getNextSyncDate(latestSync)

    return (
        <>
            <SyncDomainConfirmationModal
                isOpen={syncTriggered}
                onCancel={handleOnCancel}
                onSync={handleOnSync}
                pageType={HeaderType.Domain}
            />
            <div className={css.label}>
                <Label>Store website</Label>
                <span className={css.description}>
                    Use your website’s content and product pages as knowledge
                    for AI Agent. Re-sync when your site is updated to ensure
                    accurate responses.
                </span>
            </div>
            <div className={css.storeDomain}>
                <a
                    className={css.domain}
                    href={storeUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className={css.icon}>
                        <i className="material-icons">language</i>
                    </span>
                    {storeDomain}
                </a>
                <div className={css.actions}>
                    {latestSync && (
                        <ItemWithTooltip
                            id={syncDateId}
                            item={`Last synced ${syncDateString}`}
                            tooltip={syncDateTimeString}
                        />
                    )}
                    <div className={css.actionsButtons}>
                        <Button
                            id={syncButtonId}
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={handleTriggerSync}
                            leadingIcon="sync"
                            isLoading={isSyncPending}
                            isDisabled={
                                !storeDomain ||
                                isFetchLoading ||
                                isSyncLessThan24h
                            }
                        >
                            Sync
                        </Button>
                        {isSyncLessThan24h && (
                            <Tooltip target={syncButtonId}>
                                {`Your store website was synced less than 24h ago. You can sync again on ${nextSyncDate}.`}
                            </Tooltip>
                        )}
                        {isAiAgentFilesAndUrlsKnowledgeVisible ? (
                            <IconButton
                                size="small"
                                fillStyle="ghost"
                                intent="secondary"
                                aria-label="Open articles"
                                onClick={onManage}
                                icon="keyboard_arrow_right"
                            />
                        ) : (
                            <Button
                                intent="primary"
                                fillStyle="ghost"
                                onClick={onManage}
                            >
                                Manage
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
