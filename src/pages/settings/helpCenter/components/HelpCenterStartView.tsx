import React, {useEffect, useCallback, useMemo, FunctionComponent} from 'react'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {Container, Button} from 'reactstrap'
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
    const [
        helpCenterListResponse,
        getHelpCentersList,
    ] = useAsyncFn(async () => {
        if (client) {
            const response = await client.listHelpCenters()
            return response.data.data
        }
        return []
    }, [client, dispatch])

    useEffect(() => {
        async function init() {
            try {
                const helpCenters = await getHelpCentersList()
                dispatch(helpCentersFetched(helpCenters))
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to retrieve the help center list',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            }
        }

        void init()
    }, [dispatch, getHelpCentersList])

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
                isLoading={helpCenterListResponse.loading}
                onClick={navigateToArticles}
            />
        </div>
    )
}

export default HelpCenterStartView
