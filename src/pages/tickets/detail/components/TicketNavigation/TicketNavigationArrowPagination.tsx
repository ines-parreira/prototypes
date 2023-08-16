import React from 'react'
import classNames from 'classnames'

import useAppDispatch from 'hooks/useAppDispatch'
import {isTicketNavigationAvailable} from 'state/ticket/actions'
import Tooltip from 'pages/common/components/Tooltip'
import {ArrowPagination} from 'pages/common/components/Paginations'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'

import usePrevNextTicketNavigation from './hooks/usePrevNextTicketNavigation'

import css from './TicketNavigationArrowPagination.less'

type Props = {
    ticketId: string
}

export default function TicketNavigationArrowPagination({ticketId}: Props) {
    const dispatch = useAppDispatch()

    const paginationItemPreviousId = 'pagination-item-arrow-previous'
    const paginationItemNextId = 'pagination-item-arrow-next'

    const shouldDisplayTicketArrows = dispatch(
        isTicketNavigationAvailable(ticketId)
    )

    const goToPrevTicket = usePrevNextTicketNavigation('prev', ticketId)
    const goToNextTicket = usePrevNextTicketNavigation('next', ticketId)

    return (
        <>
            {shouldDisplayTicketArrows && (
                <>
                    <ArrowPagination
                        className={css.arrowPaginationWrapper}
                        classNameItem={classNames(
                            css.paginationItemWrapper,
                            'btn btn-sm'
                        )}
                        previousItemId={paginationItemPreviousId}
                        nextItemId={paginationItemNextId}
                        onClickPrevious={goToPrevTicket}
                        onClickNext={goToNextTicket}
                    />
                    <Tooltip
                        target={paginationItemPreviousId}
                        placement={'bottom'}
                        offset="0, 8"
                    >
                        <div className={css.paginationItemTooltip}>
                            {'Previous ticket'}
                            &nbsp;
                            <ShortcutIcon type="dark">←</ShortcutIcon>
                        </div>
                    </Tooltip>
                    <Tooltip
                        target={paginationItemNextId}
                        placement={'bottom'}
                        offset="0, 8"
                    >
                        <div className={css.paginationItemTooltip}>
                            {'Next ticket'}
                            &nbsp;
                            <ShortcutIcon type="dark">→</ShortcutIcon>
                        </div>
                    </Tooltip>
                </>
            )}
        </>
    )
}
