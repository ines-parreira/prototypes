import React from 'react'
import {Progress, Table} from 'reactstrap'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import {getIntegrationsByTypes} from '../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../models/integration/types'
import {RootState} from '../../../../state/types'
import history from '../../../history'

import {getImportCompletionDate} from './utils'
import {ImportStatus} from './types'

export const ImportZendeskDataList = (
    props: ConnectedProps<typeof connector>
) => {
    const {zendeskImports, img} = props
    const renderImportStatus = (
        integrationMeta: Map<any, any>
    ): React.ReactChild => {
        const importStatus = integrationMeta.get('status')

        if (importStatus === ImportStatus.Success) {
            return (
                <span className="float-right">
                    <i className="material-icons green">check_circle</i>{' '}
                    Completed <i className="material-icons">chevron_right</i>
                </span>
            )
        } else if (importStatus === ImportStatus.Pending) {
            const displayImportStats = integrationMeta.get(
                'display_import_stats',
                false
            )
            const accountTicketsCount = integrationMeta.getIn([
                'account_stats',
                'tickets_count',
            ])
            const ticketsCount = integrationMeta.getIn([
                'sync_tickets',
                'count',
            ])

            const getPercentage = (): number => {
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
                                style={{borderRadius: '.50rem'}}
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
                {integrationMeta.get(
                    'error',
                    'Import failed. Please contact our support.'
                )}{' '}
                <i className="material-icons">chevron_right</i>
            </span>
        )
    }

    return (
        <Table hover cursor="pointer">
            <tbody>
                {zendeskImports.map(
                    (integration: Map<any, any>, idx: number | undefined) => {
                        return (
                            <tr
                                className="cursor-pointer"
                                key={idx}
                                onClick={() => {
                                    history.push(
                                        `/app/settings/import-data/zendesk/${
                                            integration.get('id') as string
                                        }`
                                    )
                                }}
                            >
                                <td className="smallest">
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
                                <td className="align-middle">
                                    <div>
                                        <b className="mr-2">
                                            {integration.get('name')}
                                        </b>
                                        <span className="text-muted">
                                            {getImportCompletionDate(
                                                integration
                                            )}
                                        </span>
                                    </div>
                                </td>
                                <td className="align-middle text-muted">
                                    {renderImportStatus(
                                        integration.get('meta')
                                    )}
                                </td>
                            </tr>
                        )
                    }
                )}
            </tbody>
        </Table>
    )
}

const mapStateToProps = (state: RootState) => ({
    img: `${
        window.GORGIAS_ASSETS_URL || ''
    }/static/private/img/integrations/zendesk.png`,
    zendeskImports: getIntegrationsByTypes(
        IntegrationType.ZendeskIntegrationType
    )(state),
})

const connector = connect(mapStateToProps, {})
export default connector(ImportZendeskDataList)
