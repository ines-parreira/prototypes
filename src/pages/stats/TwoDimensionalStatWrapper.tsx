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
import {useAsyncFn} from 'react-use'
import {fromJS, Map} from 'immutable'
import {useSelector} from 'react-redux'

import Loader from '../common/components/Loader/Loader'
import {Stat, TwoDimensionalChart} from '../../models/stat/types'
import useAppDispatch from '../../hooks/useAppDispatch'
import {downloadStat} from '../../models/stat/resources'
import {saveFileAsDownloaded} from '../../utils/file'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import Tooltip from '../common/components/Tooltip'
import {StatsFilters} from '../../state/stats/types'
import useCancellableRequest from '../../hooks/useCancellableRequest'
import {logEvent, SegmentEvent} from '../../store/middlewares/segmentTracker'
import {getCurrentUser} from '../../state/currentUser/selectors'
import {getCurrentAccountState} from '../../state/currentAccount/selectors'

import StatsHelpIcon from './common/components/StatsHelpIcon'
import css from './TwoDimensionalStatWrapper.less'

type Props = {
    stat: Stat<TwoDimensionalChart> | null
    isFetchingStat: boolean
    resourceName: string
    statsFilters: StatsFilters
    helpText?: string
    isDownloadable?: boolean
    loaderHeight?: string
    children: (stat: Map<any, any>) => ReactNode
} & HTMLAttributes<HTMLDivElement>

export default function TwoDimensionalChartWrapper({
    stat,
    isFetchingStat,
    helpText,
    isDownloadable,
    resourceName,
    statsFilters,
    loaderHeight = '400px',
    children,
    className,
    ...wrapperProps
}: Props) {
    const dispatch = useAppDispatch()
    const currentUser = useSelector(getCurrentUser)
    const account = useSelector(getCurrentAccountState)

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
                        {stat.data.label}
                        {helpText && (
                            <span>
                                <StatsHelpIcon id={`tooltip-${resourceName}`} />
                                <Tooltip
                                    placement="top"
                                    target={`tooltip-${resourceName}`}
                                >
                                    {helpText}
                                </Tooltip>
                            </span>
                        )}
                    </h5>
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
            )}
            {isFetchingStat ? (
                <Loader minHeight={loaderHeight} />
            ) : immutableStat ? (
                children(immutableStat)
            ) : null}
        </div>
    )
}
