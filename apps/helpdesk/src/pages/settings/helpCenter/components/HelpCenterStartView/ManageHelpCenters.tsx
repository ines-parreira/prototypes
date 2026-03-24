import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { keyBy as _keyBy } from 'lodash'
import moment from 'moment'
import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    PRODUCT_BANNER_KEY,
    useProductBannerStorage,
} from 'hooks/useProductBannerStorage'
import type { HelpCenter, Locale } from 'models/helpCenter/types'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import settingsCss from 'pages/settings/settings.less'
import { helpCenterCreated } from 'state/entities/helpCenter/helpCenters'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { changeHelpCenterId, changeViewLanguage } from 'state/ui/helpCenter'

import { HELP_CENTER_BASE_PATH } from '../../constants'
import { useHelpCenterApi } from '../../hooks/useHelpCenterApi'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import HelpCenterTable from '../HelpCenterTable'
import { StandaloneBanner } from '../StandaloneBanner/StandaloneBanner'

import css from './HelpCenterStartView.less'

export type ManageHelpCentersProps = {
    standaloneHelpCenters: HelpCenter[]
    helpCenterList: HelpCenter[]
    isButtonDisabled: boolean
    isLoading: boolean
    fetchMore: () => Promise<void>
    hasMore: boolean
}

export const ManageHelpCenters = ({
    standaloneHelpCenters,
    helpCenterList,
    isButtonDisabled,
    isLoading,
    fetchMore,
    hasMore,
}: ManageHelpCentersProps) => {
    const [shouldShowProductBanner, setShouldShowProductBanner] = useState(
        standaloneHelpCenters.length > 0,
    )

    const localeOptions = useSupportedLocales()
    const localesByCode = useMemo(
        () => _keyBy<Locale>(localeOptions, 'code'),
        [localeOptions],
    )
    const history = useHistory()
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()

    const { getProductBanner, updateProductBanner } = useProductBannerStorage()

    const navigateToNextPage = useCallback(
        (
            currentHelpCenter: HelpCenter,
            shouldNavigateToWizardCreation = false,
        ) => {
            dispatch(changeHelpCenterId(currentHelpCenter.id))
            dispatch(changeViewLanguage(currentHelpCenter.default_locale))
            const path = shouldNavigateToWizardCreation ? 'new' : 'articles'
            history.push(
                `${HELP_CENTER_BASE_PATH}/${currentHelpCenter.id}/${path}`,
            )
        },
        [history, dispatch],
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
                }),
            )

            void client
                .duplicateHelpCenter(helpCenter.id)
                .then(({ data: newHelpCenter }) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            allowHTML: true,
                            message: `<b>${newHelpCenter.name}</b> successfully created.`,
                        }),
                    )

                    dispatch(helpCenterCreated(newHelpCenter))

                    navigateToNextPage(newHelpCenter)
                })
                .catch(() => {
                    void dispatch(errorNotification)
                })
        },
        [client, dispatch, navigateToNextPage],
    )

    useEffect(() => {
        const productBannerInfo = getProductBanner(
            PRODUCT_BANNER_KEY.HELP_CENTER_STANDALONE_SSP,
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
            <div className={settingsCss.pageContainer}>
                <p>You have no Help Centers at the moment.</p>
                <Button
                    isDisabled={isButtonDisabled}
                    onClick={handleAddHelpCenter}
                >
                    <div className={css.createNewButton}>
                        Create Help Center
                    </div>
                </Button>
            </div>
        )
    }

    return (
        <div className={css.infiniteScrollWrapper}>
            <InfiniteScroll
                onLoad={fetchMore}
                shouldLoadMore={!isLoading && hasMore}
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
                            onClick={navigateToNextPage}
                            duplicateHelpCenter={duplicateHelpCenter}
                        />
                    </div>
                </div>
            </InfiniteScroll>
        </div>
    )
}

export default ManageHelpCenters
