import React, {UIEventHandler, useMemo, useState} from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import useMeasure from 'hooks/useMeasure'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import Pagination from 'pages/common/components/Pagination'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import VoiceIntegrationBasicLabel from 'pages/common/components/VoiceIntegrationBasicLabel/VoiceIntegrationBasicLabel'
import VoiceCallStatusLabel from 'pages/common/components/VoiceCallStatusLabel/VoiceCallStatusLabel'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {getFormattedDurationEndedCall} from 'models/voiceCall/utils'
import {StatsFilters} from 'models/stat/types'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import VoiceCallActivity from 'pages/stats/voice/components/VoiceCallActivity/VoiceCallActivity'
import {useVoiceCallList} from 'pages/stats/voice/hooks/useVoiceCallList'
import {useVoiceCallCount} from 'pages/stats/voice/hooks/useVoiceCallCount'
import {isInboundVoiceCallSummary} from 'pages/stats/voice/models/types'
import {CALL_LIST_PAGE_SIZE} from 'pages/stats/voice/constants/voiceOverview'

import css from './VoiceCallTable.less'

type VoiceCallTableProps = {
    statsFilters: StatsFilters
    userTimezone: string
}

export const VoiceCallTable = ({
    statsFilters,
    userTimezone,
}: VoiceCallTableProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const {data, isFetching} = useVoiceCallList(
        statsFilters,
        userTimezone,
        currentPage
    )
    const {totalPages} = useVoiceCallCount(statsFilters, userTimezone)

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    const handlePageChange = (nextPage: number) => {
        setCurrentPage(nextPage)
    }

    const showSkeletons = useMemo(() => {
        return new Array(CALL_LIST_PAGE_SIZE).fill(null).map((_, rowIndex) => (
            <TableBodyRow key={rowIndex}>
                {[
                    ['activity', 407],
                    ['integration', 174],
                    ['date', 174],
                    ['state', 74],
                    ['duration', 74],
                    ['ticket', 94],
                ].map(([key, width]) => (
                    <BodyCell
                        key={key}
                        justifyContent={key === 'duration' ? 'right' : 'left'}
                    >
                        <Skeleton inline width={width} />
                    </BodyCell>
                ))}
            </TableBodyRow>
        ))
    }, [])

    if (!isFetching && data?.length === 0) {
        return (
            <NoDataAvailable
                title="No voice calls"
                description="Try adjusting filters to get results."
                className={css.noData}
            />
        )
    }

    return (
        <div ref={ref} className={css.container} onScroll={handleScroll}>
            <TableWrapper className={css.table} style={{width}}>
                <TableHead>
                    <HeaderCellProperty
                        title={'Activity'}
                        className={classNames(css.activityCell, {
                            [css.withShadow]: isTableScrolled,
                        })}
                    />
                    <HeaderCellProperty
                        title={'Integration'}
                        className={css.integrationCell}
                    />
                    <HeaderCellProperty
                        title={'Date'}
                        className={css.dateCell}
                    />
                    <HeaderCellProperty
                        title={'State'}
                        className={css.smallCell}
                        tooltip={'The status of the phone call.'}
                    />
                    <HeaderCellProperty
                        title={'Duration'}
                        justifyContent={'right'}
                        wrapContent={true}
                        className={css.smallCell}
                        tooltip={
                            'Total duration from the moment the call is started.'
                        }
                    />
                    <HeaderCellProperty
                        title={'Ticket'}
                        className={css.ticketCell}
                    />
                </TableHead>
                <TableBody>
                    {isFetching
                        ? showSkeletons
                        : data?.map((item, index) => (
                              <TableBodyRow key={`row-${index}`}>
                                  <BodyCell
                                      className={classNames(css.activityCell, {
                                          [css.withShadow]: isTableScrolled,
                                      })}
                                  >
                                      <VoiceCallActivity voiceCall={item} />
                                  </BodyCell>
                                  <BodyCell className={css.integrationCell}>
                                      {item.integrationId ? (
                                          <VoiceIntegrationBasicLabel
                                              integrationId={item.integrationId}
                                              phoneNumber={
                                                  isInboundVoiceCallSummary(
                                                      item
                                                  )
                                                      ? item.phoneNumberDestination
                                                      : item.phoneNumberSource
                                              }
                                          />
                                      ) : (
                                          '-'
                                      )}
                                  </BodyCell>
                                  <BodyCell className={css.dateCell}>
                                      <DatetimeLabel
                                          dateTime={item.createdAt?.slice(
                                              0,
                                              -4
                                          )}
                                          breakDate
                                      />
                                  </BodyCell>
                                  <BodyCell className={css.smallCell}>
                                      <VoiceCallStatusLabel
                                          voiceCallStatus={item.status}
                                          direction={item.direction}
                                      />
                                  </BodyCell>
                                  <BodyCell
                                      className={css.smallCell}
                                      justifyContent={'right'}
                                  >
                                      {!!item.duration
                                          ? getFormattedDurationEndedCall(
                                                item.duration
                                            )
                                          : '-'}
                                  </BodyCell>
                                  <BodyCell className={css.ticketCell}>
                                      {item.ticketId ? (
                                          <Link
                                              to={`/app/ticket/${item.ticketId}`}
                                          >
                                              View ticket
                                          </Link>
                                      ) : (
                                          '-'
                                      )}
                                  </BodyCell>
                              </TableBodyRow>
                          ))}
                </TableBody>
            </TableWrapper>
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    pageCount={totalPages}
                    onChange={handlePageChange}
                    className={css.pagination}
                />
            )}
        </div>
    )
}
