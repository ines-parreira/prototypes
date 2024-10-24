import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Progress, Table} from 'reactstrap'

import {DateAndTimeFormatting} from 'constants/datetime'
import {
    IntegrationType,
    ZendeskIntegration,
    ZendeskIntegrationMeta,
} from 'models/integration/types'
import history from 'pages/history'
import {getDateAndTimeFormatter, getTimezone} from 'state/currentUser/selectors'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {RootState} from 'state/types'
import {assetsUrl} from 'utils'

import {ImportStatus} from './types'
import {getImportCompletionDate} from './utils'

export const ImportZendeskDataList = (
    props: ConnectedProps<typeof connector>
) => {
    const {zendeskImports, img, timezone, datetimeFormat} = props

    const renderImportStatus = (
        integrationMeta: ZendeskIntegrationMeta
    ): React.ReactChild => {
        const importStatus = integrationMeta.status

        if (importStatus === ImportStatus.Success) {
            const synchronizationEnabled =
                integrationMeta.continuous_import_enabled
            if (synchronizationEnabled) {
                return (
                    <span className="float-right">
                        <i className="material-icons large green">
                            play_circle_filled
                        </i>{' '}
                        <span>Synchronizing</span>{' '}
                        <i className="material-icons">chevron_right</i>
                    </span>
                )
            }
            return (
                <span className="float-right">
                    <i className="material-icons large blue">
                        pause_circle_filled
                    </i>{' '}
                    <span>Paused</span>{' '}
                    <i className="material-icons">chevron_right</i>
                </span>
            )
        } else if (importStatus === ImportStatus.Pending) {
            const displayImportStats = integrationMeta.display_import_stats
            const accountTicketsCount =
                integrationMeta.account_stats.tickets_count
            const ticketsCount = integrationMeta.sync_tickets.count

            const getPercentage = (): number => {
                if (
                    ticketsCount === undefined ||
                    accountTicketsCount === undefined
                ) {
                    return 0
                }

                const importedTicketsPercentage = ~~(
                    (ticketsCount * 100) /
                    accountTicketsCount
                )
                if (!importedTicketsPercentage) {
                    return 0
                } else if (importedTicketsPercentage > 100) {
                    return 100
                }
                return importedTicketsPercentage
            }

            const importedTicketsPercentage = getPercentage()

            return (
                <div className="d-flex flex-row justify-content-end align-items-center">
                    {displayImportStats ? (
                        <>
                            <span className="mr-1">
                                Progress {importedTicketsPercentage}%
                            </span>
                            <Progress
                                className="w-25"
                                value={importedTicketsPercentage}
                                style={{
                                    borderRadius: '.50rem',
                                    maxHeight: '8px',
                                }}
                                max={100}
                            />
                        </>
                    ) : (
                        <span>Import in progress</span>
                    )}
                </div>
            )
        }

        return (
            <span className="float-right">
                <i className="material-icons red">error</i>{' '}
                {integrationMeta.error ||
                    'Import failed. Please contact our support.'}{' '}
                <i className="material-icons">chevron_right</i>
            </span>
        )
    }

    return (
        <Table hover cursor="pointer">
            <tbody>
                {zendeskImports.map((integration, idx: number | undefined) => {
                    return (
                        <tr
                            className="cursor-pointer"
                            key={idx}
                            onClick={() => {
                                history.push(
                                    `/app/settings/import-data/zendesk/${integration.id}`
                                )
                            }}
                        >
                            <td className="smallest align-middle">
                                <img
                                    alt={`Zendesk logo`}
                                    style={{
                                        maxWidth: '35px',
                                        overflow: 'hidden',
                                    }}
                                    className="rounded"
                                    src={img}
                                />
                            </td>
                            <td className="align-middle link-full-td">
                                <div className="cell-content">
                                    <b className="mr-2">{integration.name}</b>
                                    <span className="text-muted">
                                        {getImportCompletionDate(
                                            integration,
                                            datetimeFormat,
                                            timezone
                                        )}
                                    </span>
                                </div>
                            </td>
                            <td className="link-full-td align-middle text-muted">
                                {renderImportStatus(integration.meta)}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

const mapStateToProps = (state: RootState) => ({
    img: assetsUrl('/img/integrations/zendesk.png'),
    zendeskImports: getIntegrationsByType<ZendeskIntegration>(
        IntegrationType.Zendesk
    )(state),
    timezone: getTimezone(state),
    datetimeFormat: getDateAndTimeFormatter(state)(
        DateAndTimeFormatting.CompactDateWithTime
    ),
})

const connector = connect(mapStateToProps, {})
export default connector(ImportZendeskDataList)
