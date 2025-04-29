import { Button, Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import ItemWithTooltip from 'pages/common/components/ItemWithTooltip/ItemWithTooltip'

import { IngestionLogStatus } from './constant'
import SyncDomainConfirmationModal from './SyncDomainConfirmationModal'
import { IngestionLog } from './types'
import {
    getFormattedSyncDate,
    getFormattedSyncDatetime,
    getNextSyncDate,
    isSyncLessThan24Hours,
} from './utils'

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
    const syncButtonId = `syncButton-${id}`

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
            />
            <div className={css.wrapper}>
                <div className={css.header}>
                    <div className={css.title}>Store website</div>
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
                        id={syncButtonId}
                        intent="secondary"
                        onClick={handleTriggerSync}
                        leadingIcon="sync"
                        isLoading={
                            syncStoreDomainStatus === IngestionLogStatus.Pending
                        }
                        isDisabled={
                            !storeDomain || isFetchLoading || isSyncLessThan24h
                        }
                    >
                        Sync
                    </Button>
                    {isSyncLessThan24h && (
                        <Tooltip target={syncButtonId}>
                            {`Your store website was synced less than 24h ago. You can sync again on ${nextSyncDate}.`}
                        </Tooltip>
                    )}
                </div>
            </div>
        </>
    )
}

export default AiAgentScrapedDomainContentHeader
