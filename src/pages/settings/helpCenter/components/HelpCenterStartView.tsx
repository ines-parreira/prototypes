import React, {useEffect, useState, useCallback, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {Container, Button} from 'reactstrap'
import _keyBy from 'lodash/keyBy'

import {getHelpCenterClient} from '../../../../../../../rest_api/help_center_api/index'

import {RootState} from '../../../../state/types'
import {HelpCenterLocale} from '../../../../models/helpCenter/types'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {helpCentersFetched} from '../../../../state/entities/helpCenters/actions'

import PageHeader from '../../../common/components/PageHeader'

import {useLocales} from '../hooks/useLocales'
import {HELP_CENTER_BASE_PATH} from '../constants'

import HelpCentersTable from './HelpCenterTable'

import css from './HelpCenterStartView.less'

type Props = RouteComponentProps & ConnectedProps<typeof connector>

export const HelpCenterStartView = ({
    history,
    helpCenters,
    helpCentersFetched,
    notify,
}: Props) => {
    const localeOptions = useLocales()
    const localesByCode = React.useMemo(
        () => _keyBy<HelpCenterLocale>(localeOptions, 'code'),
        [localeOptions]
    )
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            try {
                const helpCenterClient = await getHelpCenterClient()
                const {
                    data: {data: helpCenters},
                } = await helpCenterClient.listHelpCenters()
                helpCentersFetched(helpCenters)
            } catch (err) {
                void notify({
                    message: 'Failed to retrieve the help center list',
                    status: NotificationStatus.Error,
                })
            } finally {
                setIsLoading(false)
            }
        }

        void init()
    }, [])

    const helpCenterList = useMemo(
        () =>
            Object.values(helpCenters).sort(
                (
                    {created_datetime: createdDate1},
                    {created_datetime: createdDate2}
                ) => {
                    if (
                        new Date(createdDate1).getTime() >
                        new Date(createdDate2).getTime()
                    ) {
                        return -1
                    }
                    return 1
                }
            ),
        [helpCenters]
    )

    const navigateToArticles = useCallback((helpCenterId: number) => {
        history.push(`${HELP_CENTER_BASE_PATH}/${helpCenterId}/articles`)
    }, [])

    return (
        <div className="full-width">
            <PageHeader title="Help Center">
                <Button
                    color="success"
                    onClick={() => history.push(`${HELP_CENTER_BASE_PATH}/new`)}
                >
                    <div className={css['create-new-btn']}>
                        <i className="material-icons mr-2">add</i>Add New
                    </div>
                </Button>
            </PageHeader>

            <Container fluid className="page-container">
                <p>
                    Help center is a tool that makes it easier to answer your
                    client’s questions in an organic way. Set up a dedicated
                    site to sideload your support flow.{' '}
                    <Link to="#">Read more</Link> about how to set it up.
                </p>
            </Container>

            <HelpCentersTable
                list={helpCenterList}
                locales={localesByCode}
                isLoading={isLoading}
                // loadingHelpCenters={loadingHelpCenters}
                // toggle={toggleHelpCenter}
                onClick={navigateToArticles}
            />
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        helpCenters: state.entities.helpCenters,
    }),
    {
        helpCentersFetched,
        // helpCenterUpdated,
        notify,
    }
)

export default withRouter(connector(HelpCenterStartView))
