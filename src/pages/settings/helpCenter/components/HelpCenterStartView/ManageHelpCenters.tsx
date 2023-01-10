import React, {useCallback, useEffect, useMemo, useState} from 'react'
import produce from 'immer'
import {keyBy as _keyBy} from 'lodash'
import moment from 'moment'
import {Container} from 'reactstrap'
import {useHistory} from 'react-router-dom'
import settingsCss from 'pages/settings/settings.less'

import {HelpCenter, Locale} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import useAppDispatch from 'hooks/useAppDispatch'
import {changeHelpCenterId, changeViewLanguage} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {
    PRODUCT_BANNER_KEY,
    useProductBannerStorage,
} from 'hooks/useProductBannerStorage'
import {NotificationStatus} from 'state/notifications/types'
import {
    helpCenterCreated,
    helpCenterDeleted,
    helpCentersFetched,
} from 'state/entities/helpCenter/helpCenters'
import {StandaloneBanner} from '../StandaloneBanner'
import HelpCenterTable from '../HelpCenterTable'

import {useSupportedLocales} from '../../providers/SupportedLocales'
import {HELP_CENTERS_PER_PAGE, HELP_CENTER_BASE_PATH} from '../../constants'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'

import css from './HelpCenterStartView.less'

export type ManageHelpCentersProps = {
    standaloneHelpCenters: HelpCenter[]
    helpCenterList: HelpCenter[]
    isButtonDisabled: boolean
    isHelpCenterLimitReached: boolean
    isLoading: boolean
    fetchMore: () => Promise<void>
    hasMore: boolean
}

export const ManageHelpCenters = ({
    standaloneHelpCenters,
    helpCenterList,
    isButtonDisabled,
    isHelpCenterLimitReached,
    isLoading,
    fetchMore,
    hasMore,
}: ManageHelpCentersProps) => {
    const [shouldShowProductBanner, setShouldShowProductBanner] = useState(
        standaloneHelpCenters.length > 0
    )

    const localeOptions = useSupportedLocales()
    const localesByCode = useMemo(
        () => _keyBy<Locale>(localeOptions, 'code'),
        [localeOptions]
    )
    const history = useHistory()
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()

    const {getProductBanner, updateProductBanner} = useProductBannerStorage()

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

    useEffect(() => {
        const productBannerInfo = getProductBanner(
            PRODUCT_BANNER_KEY.HELP_CENTER_STANDALONE_SSP
        )

        if (productBannerInfo?.closedAt) {
            return setShouldShowProductBanner(false)
        }

        setShouldShowProductBanner(standaloneHelpCenters.length > 0)
    }, [standaloneHelpCenters, setShouldShowProductBanner, getProductBanner])

    const handleCloseProductBanner = useCallback(() => {
        const now = moment()

        updateProductBanner(PRODUCT_BANNER_KEY.HELP_CENTER_STANDALONE_SSP, {
            closedAt: now.format(),
        })
        setShouldShowProductBanner(false)
    }, [updateProductBanner])

    const handleAddHelpCenter = () =>
        history.push(`${HELP_CENTER_BASE_PATH}/new`)

    if (!isLoading && !helpCenterList.length) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <p>You have no Help Centers at the moment.</p>
                <Button
                    isDisabled={isButtonDisabled}
                    onClick={handleAddHelpCenter}
                >
                    <div className={css.createNewButton}>
                        <i className="material-icons mr-2">add</i>Create New
                    </div>
                </Button>
            </Container>
        )
    }

    return (
        <div className={css.infiniteScrollWrapper}>
            <InfiniteScroll
                onLoad={fetchMore}
                shouldLoadMore={!isLoading && hasMore}
                loaderSize={HELP_CENTERS_PER_PAGE}
                className={css.infiniteScroll}
            >
                <div className={css.container}>
                    {shouldShowProductBanner && (
                        <StandaloneBanner
                            helpCenters={standaloneHelpCenters}
                            onClose={handleCloseProductBanner}
                        />
                    )}
                    <div className={css.tableHelpCenter}>
                        <HelpCenterTable
                            list={helpCenterList}
                            isLoading={helpCenterList.length === 0 && isLoading}
                            locales={localesByCode}
                            onClick={navigateToArticles}
                            duplicateHelpCenter={duplicateHelpCenter}
                            deleteHelpCenter={deleteHelpCenter}
                            onToggle={toggleActivation}
                        />
                    </div>
                </div>
            </InfiniteScroll>
            {isLoading ? null : (
                <>
                    <div className={css.addHelpCenter}>
                        <Button
                            id="add-new-help-center-button"
                            isDisabled={isButtonDisabled}
                            onClick={handleAddHelpCenter}
                        >
                            <div className={css.createNewButton}>
                                <i className="material-icons mr-2">add</i>Create
                                New
                            </div>
                        </Button>
                    </div>
                    <Tooltip
                        disabled={!isHelpCenterLimitReached}
                        placement="top-start"
                        target="add-new-help-center-button"
                        style={{
                            textAlign: 'start',
                            width: 180,
                        }}
                    >
                        Please contact us to create more Help Centers.
                    </Tooltip>
                </>
            )}
        </div>
    )
}

export default ManageHelpCenters
