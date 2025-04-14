import { Button, Label } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import SyncDomainConfirmationModal from 'pages/aiAgent/AiAgentScrapedDomainContent/SyncDomainConfirmationModal'
import {
    getFormattedSyncDate,
    getFormattedSyncDatetime,
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
    onStatusChange: (status: string | null) => void
}

export const ScrapeStoreDomainSection = ({
    shopName,
    helpCenterId,
    onStatusChange,
}: Props) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`

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
    } = useSyncStoreDomain({ helpCenterId, shopName })

    const { syncIsPending } = usePollStoreDomainIngestionLog({
        helpCenterId,
        storeUrl,
        onStatusChange,
    })

    const latestSync = storeDomainIngestionLog?.latest_sync
    const syncDateString = getFormattedSyncDate(latestSync)
    const syncDateTimeString = getFormattedSyncDatetime(latestSync)

    return (
        <>
            <SyncDomainConfirmationModal
                isOpen={syncTriggered}
                onCancel={handleOnCancel}
                onSync={handleOnSync}
            />
            <div className={css.label}>
                <Label>Your store domain</Label>
                <span>AI Agent uses content from your store website.</span>
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
                    <div>
                        <Button
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={handleTriggerSync}
                            leadingIcon="sync"
                            isLoading={syncIsPending}
                            isDisabled={!storeDomain || isFetchLoading}
                        >
                            Sync
                        </Button>
                        <Button
                            intent="primary"
                            fillStyle="ghost"
                            onClick={onManage}
                        >
                            Manage
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
