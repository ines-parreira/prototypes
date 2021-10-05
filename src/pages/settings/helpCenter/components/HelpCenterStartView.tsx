import React, {useEffect, useCallback, useMemo, FunctionComponent} from 'react'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {Container, Button} from 'reactstrap'
import produce from 'immer'
import _keyBy from 'lodash/keyBy'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {HelpCenterLocale} from '../../../../models/helpCenter/types'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {helpCentersFetched} from '../../../../state/entities/helpCenters/actions'
import {getHelpcenterSortedList} from '../../../..//state/entities/helpCenters/selectors'
import {
    changeHelpCenterId,
    changeViewLanguage,
} from '../../../../state/helpCenter/ui'

import PageHeader from '../../../common/components/PageHeader'

import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useLocales} from '../hooks/useLocales'
import {HELP_CENTER_BASE_PATH} from '../constants'

import HelpCentersTable from './HelpCenterTable'

import css from './HelpCenterStartView.less'

export const HelpCenterStartView: FunctionComponent = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()

    const {client} = useHelpcenterApi()
    const localeOptions = useLocales()

    const helpCenterList = useSelector(getHelpcenterSortedList)
    const localesByCode = useMemo(
        () => _keyBy<HelpCenterLocale>(localeOptions, 'code'),
        [localeOptions]
    )
    const [{loading}, getHelpCentersList] = useAsyncFn(async () => {
        if (client) {
            try {
                const {
                    data: {data: helpCenters},
                } = await client.listHelpCenters()

                dispatch(helpCentersFetched(helpCenters))
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to retrieve the Help Center list',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            }
        }
    }, [client])

    useEffect(() => {
        if (!loading) {
            void getHelpCentersList()
        }
    }, [getHelpCentersList])

    const navigateToArticles = useCallback(
        (helpCenterId: number) => {
            const currentHelpCenter = helpCenterList.find(
                ({id}) => id === helpCenterId
            )

            if (currentHelpCenter) {
                dispatch(changeHelpCenterId(currentHelpCenter.id))
                dispatch(changeViewLanguage(currentHelpCenter.default_locale))
                history.push(
                    `${HELP_CENTER_BASE_PATH}/${helpCenterId}/articles`
                )
            }
        },
        [helpCenterList, history, dispatch]
    )

    const toggleActivation = useCallback(
        async (helpCenterId: number, activated: boolean) => {
            if (client) {
                try {
                    const helpcenterIndex = helpCenterList.findIndex(
                        ({id}) => id === helpCenterId
                    )
                    const helpCenter = await client.updateHelpCenter(
                        {help_center_id: helpCenterId},
                        {
                            deactivated: !activated,
                        }
                    )
                    const helpCenterListUpdated = produce(
                        helpCenterList,
                        (helpCenters) => {
                            helpCenters[helpcenterIndex] = helpCenter.data
                        }
                    )
                    dispatch(helpCentersFetched(helpCenterListUpdated))
                    void dispatch(
                        notify({
                            message: `Help Center ${
                                activated ? 'activated' : 'deactivated'
                            }`,
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (e) {
                    void dispatch(
                        notify({
                            message:
                                'Something went wrong saving the Help Center',
                            status: NotificationStatus.Error,
                        })
                    )
                    throw e
                }
            }
        },
        [helpCenterList, client, dispatch]
    )

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
                    Help Center is a tool that makes it easier to answer your
                    client’s questions in an organic way. Set up a dedicated
                    site to sideload your support flow.{' '}
                    <Link to="#">Read more</Link> about how to set it up.
                </p>
            </Container>

            <HelpCentersTable
                list={helpCenterList}
                locales={localesByCode}
                isLoading={loading}
                onClick={navigateToArticles}
                onToggle={toggleActivation}
            />
        </div>
    )
}

export default HelpCenterStartView
