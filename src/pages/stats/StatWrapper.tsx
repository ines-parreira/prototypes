import React, {
    HTMLAttributes,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
} from 'react'
import {Button} from 'reactstrap'
import classnames from 'classnames'
import axios, {AxiosError, CancelToken} from 'axios'
import {fromJS, Map} from 'immutable'

import {logEvent, SegmentEvent} from 'common/segment'
import Loader from 'pages/common/components/Loader/Loader'
import {Stat, StatsFilters, TwoDimensionalChart} from 'models/stat/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import {downloadStat} from 'models/stat/resources'
import {saveFileAsDownloaded} from 'utils/file'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Tooltip from 'pages/common/components/Tooltip'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import StatsHelpIcon from './common/components/StatsHelpIcon'
import css from './StatWrapper.less'

type Props = {
    stat: Stat<TwoDimensionalChart> | null
    statDataLabelOverride?: ReactNode
    isFetchingStat: boolean
    resourceName: string
    statsFilters: StatsFilters
    helpText?: ReactNode
    visibilityLink?: {
        href: string
        icon?: ReactNode
        label: string
    }
    helpAutoHide?: boolean
    isDownloadable?: boolean
    loaderHeight?: string
    children: (stat: Map<any, any>) => ReactNode
    refineDownload?: (csvData: string) => string
} & HTMLAttributes<HTMLDivElement>

export default function StatWrapper({
    stat,
    statDataLabelOverride,
    isFetchingStat,
    helpText,
    isDownloadable,
    resourceName,
    statsFilters,
    loaderHeight = '400px',
    children,
    className,
    helpAutoHide,
    visibilityLink,
    refineDownload,
    ...wrapperProps
}: Props) {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const account = useAppSelector(getCurrentAccountState)

    const [{loading: isDownloading}, handleDownloadStat] = useAsyncFn(
        async (cancelToken: CancelToken) => {
            logEvent(SegmentEvent.StatDownloadClicked, {
                name: resourceName,
                user_id: currentUser.get('id'),
                account_domain: account.get('domain'),
            })
            try {
                const file = await downloadStat(
                    resourceName,
                    {
                        filters: statsFilters,
                    },
                    {
                        cancelToken,
                    }
                )
                if (refineDownload) {
                    file.data = refineDownload(file.data)
                }
                saveFileAsDownloaded(file.name, file.data, file.contentType)
            } catch (error) {
                if (axios.isCancel(error)) {
                    return
                }

                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        title:
                            (error as AxiosError<{error?: {msg: string}}>)
                                .response?.data?.error?.msg ||
                            'Failed to download statistic. Please retry in a few seconds.',
                    })
                )
            }
        },
        [statsFilters, resourceName, statsFilters, currentUser, account]
    )

    const createDownloadStat = useCallback(
        (cancelToken: CancelToken) => () => handleDownloadStat(cancelToken),
        [handleDownloadStat]
    )

    const [handleCancellableDownloadStat, cancelDownloadStat] =
        useCancellableRequest(createDownloadStat)

    useEffect(() => {
        return () => {
            cancelDownloadStat()
        }
    }, [statsFilters, cancelDownloadStat])

    const immutableStat = useMemo(() => {
        return fromJS(stat) as Map<any, any> | null
    }, [stat])

    return (
        <div className={classnames(css.wrapper, className)} {...wrapperProps}>
            {stat && (
                <div className="mb-3 d-flex justify-content-between align-items-baseline">
                    <h5 className={classnames('mb-0', 'd-flex', css.header)}>
                        {statDataLabelOverride ?? stat.data.label}
                        {helpText && (
                            <span>
                                <StatsHelpIcon id={`tooltip-${resourceName}`} />
                                <Tooltip
                                    placement="top"
                                    target={`tooltip-${resourceName}`}
                                    autohide={helpAutoHide}
                                >
                                    {helpText}
                                </Tooltip>
                            </span>
                        )}
                    </h5>
                    <div className={css.buttonContainer}>
                        {!!visibilityLink && (
                            <Button tag="a" href={visibilityLink.href}>
                                {visibilityLink.icon}
                                {visibilityLink.label}
                            </Button>
                        )}
                        {isDownloadable && (
                            <Button
                                onClick={handleCancellableDownloadStat}
                                className={css.csvButton}
                                disabled={isDownloading || isFetchingStat}
                            >
                                {isDownloading ? (
                                    <Loader
                                        size="14px"
                                        minHeight="14px"
                                        className={classnames(
                                            css.csvLoader,
                                            'mr-1'
                                        )}
                                    />
                                ) : (
                                    <i
                                        className={classnames(
                                            'material-icons mr-1',
                                            css.csvButtonIcon
                                        )}
                                    >
                                        file_download
                                    </i>
                                )}
                                CSV
                            </Button>
                        )}
                    </div>
                </div>
            )}
            {isFetchingStat ? (
                <Loader minHeight={loaderHeight} />
            ) : immutableStat ? (
                children(immutableStat)
            ) : null}
        </div>
    )
}
