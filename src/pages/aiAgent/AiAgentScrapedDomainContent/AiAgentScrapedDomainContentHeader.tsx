import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import Button from 'pages/common/components/button/Button'

import css from './AiAgentScrapedDomainContentHeader.less'

type Props = {
    storeDomain: string
    lastSyncDate?: Date
    onSync: () => void
}

const AiAgentScrapedDomainContentHeader = ({
    storeDomain,
    lastSyncDate,
    onSync,
}: Props) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`

    const dateOptions: Intl.DateTimeFormatOptions = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    }

    const dateTimeOptions: Intl.DateTimeFormatOptions = {
        ...dateOptions,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }
    const syncDateString = lastSyncDate?.toLocaleDateString(
        'en-US',
        dateOptions,
    )
    const syncDateTimeString = lastSyncDate?.toLocaleDateString(
        'en-US',
        dateTimeOptions,
    )

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
                    <div id={syncDateId}>Last synced {syncDateString}</div>
                )}
                <Tooltip target={syncDateId}>{syncDateTimeString}</Tooltip>
                <Button intent="secondary" onClick={onSync} leadingIcon="sync">
                    Sync
                </Button>
            </div>
        </div>
    )
}

export default AiAgentScrapedDomainContentHeader
