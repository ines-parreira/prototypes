import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppDispatch from 'hooks/useAppDispatch'
import {isTicketNavigationAvailable} from 'state/ticket/actions'
import Tooltip from 'pages/common/components/Tooltip'
import {ArrowPagination} from 'pages/common/components/Paginations'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {FeatureFlagKey} from 'config/featureFlags'
import {useSplitTicketView} from 'split-ticket-view-toggle'

import useGoToPreviousTicket from './hooks/useGoToPreviousTicket'
import useGoToNextTicket from './hooks/useGoToNextTicket'
import css from './TicketNavigationArrowPagination.less'

type Props = {
    ticketId: string
}

export default function TicketNavigationArrowPagination({ticketId}: Props) {
    const dispatch = useAppDispatch()

    const paginationItemPreviousId = 'pagination-item-arrow-previous'
    const paginationItemNextId = 'pagination-item-arrow-next'

    const hasSplitTicketView: boolean | undefined =
        useFlags()[FeatureFlagKey.SplitTicketView]
    const {isEnabled} = useSplitTicketView()
    const isSplitTicketViewEnabled = hasSplitTicketView && isEnabled

    const {goToTicket: goToPrevTicket, isEnabled: isPreviousEnabled} =
        useGoToPreviousTicket(ticketId)
    const {goToTicket: goToNextTicket, isEnabled: isNextEnabled} =
        useGoToNextTicket(ticketId)

    const shouldDisplayTicketArrows = isSplitTicketViewEnabled
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
                        isPreviousDisabled={
                            isSplitTicketViewEnabled
                                ? !isPreviousEnabled
                                : false
                        }
                        isNextDisabled={
                            isSplitTicketViewEnabled ? !isNextEnabled : false
                        }
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
