import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import ItemWithTooltip from 'pages/common/components/ItemWithTooltip/ItemWithTooltip'

import { getFormattedSyncDate, getFormattedSyncDatetime } from './utils'

import css from './AiAgentScrapedDomainContentHeader.less'

type Props = {
    storeDomain: string
    lastSyncDate?: string
    onSync: () => void
}

const AiAgentScrapedDomainContentHeader = ({
    storeDomain,
    lastSyncDate,
    onSync,
}: Props) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`

    const syncDateString = getFormattedSyncDate(lastSyncDate)
    const syncDateTimeString = getFormattedSyncDatetime(lastSyncDate)

    return (
        <div className={css.wrapper}>
            <div className={css.header}>
                <div className={css.title}>Your store domain</div>
                <a
                    className={css.domain}
                    href={`https://${storeDomain}`}
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
                {lastSyncDate && (
                    <ItemWithTooltip
                        id={syncDateId}
                        item={`Last synced ${syncDateString}`}
                        tooltip={syncDateTimeString}
                    />
                )}
                <Button intent="secondary" onClick={onSync} leadingIcon="sync">
                    Sync
                </Button>
            </div>
        </div>
    )
}

export default AiAgentScrapedDomainContentHeader
