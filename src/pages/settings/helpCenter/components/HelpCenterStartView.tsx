import React, {useEffect, useCallback, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {Container} from 'reactstrap'
import produce from 'immer'
import _keyBy from 'lodash/keyBy'
import moment from 'moment-timezone'

import Button from 'pages/common/components/button/Button'

import useAppDispatch from 'hooks/useAppDispatch'

import {HelpCenter, Locale} from 'models/helpCenter/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    helpCenterCreated,
    helpCenterDeleted,
    helpCentersFetched,
} from 'state/entities/helpCenter/helpCenters/actions'
import {changeHelpCenterId, changeViewLanguage} from 'state/ui/helpCenter'
import PageHeader from 'pages/common/components/PageHeader'
import Tooltip from 'pages/common/components/Tooltip'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import {
    PRODUCT_BANNER_KEY,
    useProductBannerStorage,
} from 'hooks/useProductBannerStorage'

import {useHelpCenterApi, useAbilityChecker} from '../hooks/useHelpCenterApi'
import {useSupportedLocales} from '../providers/SupportedLocales'
import {
    HELP_CENTER_MAX_CREATION,
    HELP_CENTER_BASE_PATH,
    HELP_CENTERS_PER_PAGE,
} from '../constants'
import settingsCss from '../../settings.less'
import {useHelpCenterList} from '../hooks/useHelpCenterList'
import {useStandaloneHelpCenterAfterDismiss} from '../hooks/useStandaloneHelpCenterAfterDismiss'

import {StandaloneBanner} from './StandaloneBanner'
import HelpCenterTable from './HelpCenterTable'

import css from './HelpCenterStartView.less'

export const HelpCenterStartView: React.FC = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const {client} = useHelpCenterApi()
    const localeOptions = useSupportedLocales()
    const localesByCode = useMemo(
        () => _keyBy<Locale>(localeOptions, 'code'),
        [localeOptions]
    )
    const {
        isLoading,
        hasMore,
        fetchMore,
        helpCenters: helpCenterList,
    } = useHelpCenterList({
        per_page: HELP_CENTERS_PER_PAGE,
    })

    const standaloneHelpCenters = useStandaloneHelpCenterAfterDismiss(
        helpCenterList,
        PRODUCT_BANNER_KEY.HELP_CENTER_STANDALONE_SSP
    )
    const [shouldShowProductBanner, setShouldShowProductBanner] = useState(
        standaloneHelpCenters.length > 0
    )
    const {getProductBanner, updateProductBanner} = useProductBannerStorage()

    const {isPassingRulesCheck} = useAbilityChecker()

    useEffect(() => {
        dispatch(changeHelpCenterId(null))
    }, [dispatch])

    useEffect(() => {
        const productBannerInfo = getProductBanner(
            PRODUCT_BANNER_KEY.HELP_CENTER_STANDALONE_SSP
        )

        if (productBannerInfo?.closedAt) {
            return setShouldShowProductBanner(false)
        }

        setShouldShowProductBanner(standaloneHelpCenters.length > 0)
    }, [standaloneHelpCenters, setShouldShowProductBanner, getProductBanner])

    const navigateToArticles = useCallback(
        (currentHelpCenter: HelpCenter) => {
            dispatch(changeHelpCenterId(currentHelpCenter.id))
            dispatch(changeViewLanguage(currentHelpCenter.default_locale))
            history.push(
                `${HELP_CENTER_BASE_PATH}/${currentHelpCenter.id}/articles`
            )
        },
        [history, dispatch]
    )

    const duplicateHelpCenter = useCallback(
        (helpCenter: HelpCenter): void => {
            const errorNotification = notify({
                status: NotificationStatus.Error,
                allowHTML: true,
                message: `Something went wrong. We could not duplicate <b>${helpCenter.name}</b>.`,
            })

            if (!client) {
                void dispatch(errorNotification)

                return
            }

            void dispatch(
                notify({
                    status: NotificationStatus.Loading,
                    allowHTML: true,
                    message: `Duplicating <b>${helpCenter.name}</b>. It may take up to a minute.`,

                    dismissible: false,
                    dismissAfter: 0,
                    closeOnNext: true,
                })
            )

            void client
                .duplicateHelpCenter(helpCenter.id)
                .then(({data: newHelpCenter}) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            allowHTML: true,
                            message: `<b>${newHelpCenter.name}</b> successfully created.`,
                        })
                    )

                    dispatch(helpCenterCreated(newHelpCenter))

                    navigateToArticles(newHelpCenter)
                })
                .catch(() => {
                    void dispatch(errorNotification)
                })
        },
        [client, dispatch, navigateToArticles]
    )
    const deleteHelpCenter = useCallback(
        (helpCenter: HelpCenter): void => {
            const errorNotification = notify({
                status: NotificationStatus.Error,
                allowHTML: true,
                message: `Something went wrong. We could not delete <b>${helpCenter.name}</b>.`,
            })

            if (!client) {
                void dispatch(errorNotification)

                return
            }

            void client
                .deleteHelpCenter(helpCenter.id)
                .then(() => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            allowHTML: true,
                            message: `<b>${helpCenter.name}</b> successfully deleted.`,
                        })
                    )

                    dispatch(helpCenterDeleted(helpCenter.id))
                })
                .catch(() => {
                    void dispatch(errorNotification)
                })
        },
        [client, dispatch]
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

    const handleCloseProductBanner = useCallback(() => {
        const now = moment()

        updateProductBanner(PRODUCT_BANNER_KEY.HELP_CENTER_STANDALONE_SSP, {
            closedAt: now.format(),
        })
        setShouldShowProductBanner(false)
    }, [updateProductBanner])

    const isHelpCenterLimitReached =
        helpCenterList.length >= HELP_CENTER_MAX_CREATION

    return (
        <InfiniteScroll
            className="full-width"
            onLoad={fetchMore}
            shouldLoadMore={!isLoading && hasMore}
            loaderSize={20}
        >
            <PageHeader title="Help Center">
                <div id="add-new-help-center-button-wrapper">
                    <Button
                        isDisabled={
                            isPassingRulesCheck(({can}) =>
                                can('create', 'HelpCenterEntity')
                            )
                                ? isHelpCenterLimitReached
                                : true
                        }
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
                    disabled={!isHelpCenterLimitReached}
                    placement="bottom-end"
                    target="add-new-help-center-button-wrapper"
                    style={{
                        textAlign: 'start',
                        width: 180,
                    }}
                >
                    Please contact us to create more Help Centers.
                </Tooltip>
            </PageHeader>

            <Container
                fluid
                className={settingsCss.pageContainer}
                data-candu-id="help-center-description"
            >
                <p>
                    Help Center is a tool that makes it easier to answer your
                    customers’ questions in an organic way. Set up a dedicated
                    site to sideload your support flow.{' '}
                    <a
                        href="https://docs.gorgias.com/help-center/gorgias-help-center"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Read more
                    </a>{' '}
                    about how to set it up.
                </p>
                {shouldShowProductBanner && (
                    <StandaloneBanner
                        helpCenters={standaloneHelpCenters}
                        onClose={handleCloseProductBanner}
                    />
                )}
            </Container>
            <HelpCenterTable
                list={helpCenterList}
                isLoading={helpCenterList.length === 0 && isLoading}
                locales={localesByCode}
                onClick={navigateToArticles}
                duplicateHelpCenter={duplicateHelpCenter}
                deleteHelpCenter={deleteHelpCenter}
                onToggle={toggleActivation}
            />
        </InfiniteScroll>
    )
}

export default HelpCenterStartView
