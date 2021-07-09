import React, {useEffect, useState, useCallback, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {Container, Button} from 'reactstrap'
import keyBy from 'lodash/keyBy'

import {HelpCenterLocale} from '../../../../models/helpCenter/types'

import PageHeader from '../../../common/components/PageHeader'
import {HELP_CENTER_BASE_PATH} from '../constants'
import {getLocalesResponseFixture} from '../fixtures/getLocalesResponse.fixtures'

import {RootState} from '../../../../state/types'
import {
    helpCentersFetched,
    // helpCenterUpdated,
} from '../../../../state/entities/helpCenters/actions'
import {
    getHelpCenterClient,
    // HelpCenterClient,
} from '../../../../../../../rest_api/help_center_api/index'
import {NotificationStatus} from '../../../../state/notifications/types'
import {notify} from '../../../../state/notifications/actions'

import HelpCentersTable from './HelpCenterTable'
import css from './HelpCenterStartView.less'

type Props = RouteComponentProps & ConnectedProps<typeof connector>

const localesByCode = keyBy<HelpCenterLocale>(
    getLocalesResponseFixture as HelpCenterLocale[],
    'code'
)

// let helpCenterClient: HelpCenterClient

export const HelpCenterStartView = ({
    history,
    helpCenters,
    helpCentersFetched,
    // helpCenterUpdated,
    notify,
}: Props) => {
    // const [loadingHelpCenters, setLoadingHelpCenters] = useState<{
    //     [key: number]: boolean
    // }>({})
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

    // const toggleHelpCenter = async (
    //     helpCenterId: number,
    //     newToggleValue: boolean
    // ) => {
    //     const deactivated_datetime = newToggleValue
    //         ? null
    //         : new Date().toISOString()

    //     setLoadingHelpCenters((prevLoadingHelpCenters) => ({
    //         ...prevLoadingHelpCenters,
    //         [helpCenterId]: true,
    //     }))
    //     try {
    //         const {
    //             data: updatedHelpcenter,
    //         } = await helpCenterClient.updateHelpCenter(
    //             {
    //                 id: helpCenterId,
    //             },
    //             {deactivated_datetime}
    //         )
    //         helpCenterUpdated(updatedHelpcenter)
    //     } catch (err) {
    //         notify({
    //             message: 'Failed to update the helpcenter',
    //             status: NotificationStatus.Error,
    //         })
    //     } finally {
    //         setLoadingHelpCenters((prevLoadingHelpCenters) => ({
    //             ...prevLoadingHelpCenters,
    //             [helpCenterId]: false,
    //         }))
    //     }
    // }

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
