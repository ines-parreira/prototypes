import { useMemo } from 'react'

import { useId } from '@repo/hooks'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import ItemWithTooltip from 'pages/common/components/ItemWithTooltip/ItemWithTooltip'

import { HeaderType, IngestionLogStatus } from './constant'
import SyncDomainConfirmationModal from './SyncDomainConfirmationModal'
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
    latestSync?: string | null
    isFetchLoading: boolean
    syncTriggered: boolean
    handleOnSync?: () => void
    handleOnCancel?: () => void
    handleTriggerSync?: () => void
    syncStoreDomainStatus: string | null
    title: string
    pageType: HeaderType
}

const AiAgentScrapedDomainContentHeader = ({
    storeDomain,
    storeUrl,
    latestSync,
    isFetchLoading,
    syncTriggered,
    handleOnSync,
    handleOnCancel,
    handleTriggerSync,
    syncStoreDomainStatus,
    title,
    pageType,
}: Props) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`
    const syncButtonId = `syncButton-${id}`

    const syncDateString = getFormattedSyncDate(latestSync)
    const syncDateTimeString = getFormattedSyncDatetime(latestSync)
    const isSyncLessThan24h = isSyncLessThan24Hours(latestSync)
    const nextSyncDate = getNextSyncDate(latestSync)

    const isDomainScrapedPage = pageType === HeaderType.Domain

    const getTitleIcon = useMemo(() => {
        switch (pageType) {
            case HeaderType.Domain:
                return 'language'
            case HeaderType.ExternalDocument:
                return 'attach_file'
            case HeaderType.URL:
                return 'link'
            default:
                return 'language'
        }
    }, [pageType])

    return (
        <>
            {!!handleOnSync && !!handleOnCancel && (
                <SyncDomainConfirmationModal
                    isOpen={syncTriggered}
                    onCancel={handleOnCancel}
                    onSync={handleOnSync}
                    pageType={pageType}
                />
            )}
            <div className={css.wrapper}>
                <div className={css.header}>
                    <div className={css.title}>{title}</div>
                    {storeUrl ? (
                        <a
                            className={css.domain}
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className={css.icon}>
                                <i className="material-icons">{getTitleIcon}</i>
                            </span>
                            {storeDomain}
                        </a>
                    ) : (
                        <div className="body-regular">
                            <span className={css.icon}>
                                <i className="material-icons">{getTitleIcon}</i>
                            </span>
                            {storeDomain}
                        </div>
                    )}
                </div>
                <div className={css.actions}>
                    {latestSync && (
                        <ItemWithTooltip
                            id={syncDateId}
                            item={`Last synced ${syncDateString}`}
                            tooltip={syncDateTimeString}
                        />
                    )}
                    {pageType !== HeaderType.ExternalDocument && (
                        <Button
                            id={syncButtonId}
                            intent="secondary"
                            onClick={handleTriggerSync}
                            leadingIcon="sync"
                            isLoading={
                                syncStoreDomainStatus ===
                                IngestionLogStatus.Pending
                            }
                            isDisabled={
                                isDomainScrapedPage &&
                                (!storeDomain ||
                                    isFetchLoading ||
                                    isSyncLessThan24h)
                            }
                        >
                            Sync
                        </Button>
                    )}

                    {isSyncLessThan24h && isDomainScrapedPage && (
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
