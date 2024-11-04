import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {ArrowPagination} from 'pages/common/components/Paginations'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import {isTicketNavigationAvailable} from 'state/ticket/actions'
import {getActiveView} from 'state/views/selectors'

import useGoToNextTicket from './hooks/useGoToNextTicket'
import useGoToPreviousTicket from './hooks/useGoToPreviousTicket'
import css from './TicketNavigationArrowPagination.less'

type Props = {
    ticketId: string
}

export default function TicketNavigationArrowPagination({ticketId}: Props) {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const isSearchView = useMemo(
        () => activeView.get('search') != null,
        [activeView]
    )

    const paginationItemPreviousId = 'pagination-item-arrow-previous'
    const paginationItemNextId = 'pagination-item-arrow-next'

    const {isEnabled: isSplitTicketViewEnabled} = useSplitTicketView()

    const {goToTicket: goToPrevTicket, isEnabled: isPreviousEnabled} =
        useGoToPreviousTicket(ticketId)
    const {goToTicket: goToNextTicket, isEnabled: isNextEnabled} =
        useGoToNextTicket(ticketId)

    const shouldDisplayTicketArrows =
        isSplitTicketViewEnabled && !isSearchView
            ? isPreviousEnabled || isNextEnabled
            : dispatch(isTicketNavigationAvailable(ticketId))

    return (
        <>
            {shouldDisplayTicketArrows && (
                <>
                    <ArrowPagination
                        className={css.arrowPaginationWrapper}
                        classNameItem={css.paginationItemWrapper}
                        previousItemId={paginationItemPreviousId}
                        nextItemId={paginationItemNextId}
                        onClickPrevious={goToPrevTicket}
                        onClickNext={goToNextTicket}
                        isPreviousDisabled={!isPreviousEnabled}
                        isNextDisabled={!isNextEnabled}
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
