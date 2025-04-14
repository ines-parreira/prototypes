import { Button } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import ItemWithTooltip from 'pages/common/components/ItemWithTooltip/ItemWithTooltip'

import { IngestionLogStatus } from './constant'
import SyncDomainConfirmationModal from './SyncDomainConfirmationModal'
import { IngestionLog } from './types'
import { getFormattedSyncDate, getFormattedSyncDatetime } from './utils'

import css from './AiAgentScrapedDomainContentHeader.less'

type Props = {
    storeDomain: string | null
    storeUrl: string | null
    storeDomainIngestionLog?: IngestionLog
    isFetchLoading: boolean
    syncTriggered: boolean
    handleOnSync: () => void
    handleOnCancel: () => void
    handleTriggerSync: () => void
    syncStoreDomainStatus: string | null
}

const AiAgentScrapedDomainContentHeader = ({
    storeDomain,
    storeUrl,
    storeDomainIngestionLog,
    isFetchLoading,
    syncTriggered,
    handleOnSync,
    handleOnCancel,
    handleTriggerSync,
    syncStoreDomainStatus,
}: Props) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`

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
            <div className={css.wrapper}>
                <div className={css.header}>
                    <div className={css.title}>Your store domain</div>
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
                </div>
                <div className={css.actions}>
                    {latestSync && (
                        <ItemWithTooltip
                            id={syncDateId}
                            item={`Last synced ${syncDateString}`}
                            tooltip={syncDateTimeString}
                        />
                    )}
                    <Button
                        intent="secondary"
                        onClick={handleTriggerSync}
                        leadingIcon="sync"
                        isLoading={
                            syncStoreDomainStatus === IngestionLogStatus.Pending
                        }
                        isDisabled={!storeDomain || isFetchLoading}
                    >
                        Sync
                    </Button>
                </div>
            </div>
        </>
    )
}

export default AiAgentScrapedDomainContentHeader
