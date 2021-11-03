import React, {useEffect, useCallback, useMemo, FunctionComponent} from 'react'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {Container, Button} from 'reactstrap'
import produce from 'immer'
import _keyBy from 'lodash/keyBy'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {Locale} from '../../../../models/helpCenter/types'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {helpCentersFetched} from '../../../../state/entities/helpCenters/actions'
import {getHelpCenterSortedList} from '../../../..//state/entities/helpCenters/selectors'
import {
    changeHelpCenterId,
    changeViewLanguage,
} from '../../../../state/helpCenter/ui'

import PageHeader from '../../../common/components/PageHeader'

import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useLocales} from '../hooks/useLocales'
import {
    HELP_CENTER_MAX_CREATION,
    HELP_CENTER_BASE_PATH,
    HELP_CENTER_PAYWALLS_ENABLED,
} from '../constants'
import Tooltip from '../../../common/components/Tooltip'

import HelpCentersTable from './HelpCenterTable'

import css from './HelpCenterStartView.less'

export const HelpCenterStartView: FunctionComponent = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const {client} = useHelpCenterApi()
    const localeOptions = useLocales()
    const helpCenterList = useSelector(getHelpCenterSortedList)
    const localesByCode = useMemo(() => _keyBy<Locale>(localeOptions, 'code'), [
        localeOptions,
    ])

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
                    const helpCenterIndex = helpCenterList.findIndex(
                        ({id}) => id === helpCenterId
                    )
                    const {data} = await client.updateHelpCenter(
                        {help_center_id: helpCenterId},
                        {
                            deactivated: !activated,
                        }
                    )
                    const helpCenterListUpdated = produce(
                        helpCenterList,
                        (helpCenters) => {
                            helpCenters[helpCenterIndex] = data
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

    const addNewButtonDisabled =
        HELP_CENTER_PAYWALLS_ENABLED &&
        helpCenterList.length >= HELP_CENTER_MAX_CREATION

    return (
        <div className="full-width">
            <PageHeader title="Help Center">
                <div id="add-new-help-center-button-wrapper">
                    <Button
                        disabled={addNewButtonDisabled}
                        color="success"
                        onClick={() =>
                            history.push(`${HELP_CENTER_BASE_PATH}/new`)
                        }
                    >
                        <div className={css['create-new-btn']}>
                            <i className="material-icons mr-2">add</i>Add New
                        </div>
                    </Button>
                </div>
                <Tooltip
                    disabled={!addNewButtonDisabled}
                    placement="bottom-end"
                    target="add-new-help-center-button-wrapper"
                    style={{
                        textAlign: 'start',
                        width: 180,
                    }}
                >
                    Please contact us to create more help centers.
                </Tooltip>
            </PageHeader>

            <Container fluid className="page-container">
                <p>
                    Help Center is a tool that makes it easier to answer your
                    client’s questions in an organic way. Set up a dedicated
                    site to sideload your support flow.{' '}
                    <a
                        href="https://docs.gorgias.com/other-integrations/gorgias-help-center"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Read more
                    </a>{' '}
                    about how to set it up.
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
