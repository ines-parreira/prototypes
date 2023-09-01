import React, {useMemo} from 'react'
import {fromJS, Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {toggleHistory} from 'state/ticket/actions'
import {getDisplayHistory} from 'state/ticket/selectors'
import {getCustomersState, makeIsLoading} from 'state/customers/selectors'
import Tooltip from 'pages/common/components/Tooltip'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import css from './CustomerTimelineButton.less'

type Props = {
    isEditing: boolean
}

export function CustomerTimelineButton({isEditing = false}: Props) {
    const dispatch = useAppDispatch()

    const customerTimelineButtonId = 'customer-timeline-button'
    const isHistoryDisplayed = useAppSelector(getDisplayHistory)
    const ticket = useAppSelector((state) => state.ticket)

    const customers = useAppSelector(getCustomersState)
    const isCustomersLoading = useAppSelector(makeIsLoading)
    const customerHistory = useMemo(
        () => (customers.get('customerHistory') as Map<any, any>) || fromJS({}),
        [customers]
    )

    const isButtonRendered = isEditing || !ticket.get('id')

    const isHistoryDisabled =
        !customerHistory.get('hasHistory') || isCustomersLoading('history')

    const handleCustomerTimelineButtonClick = () => {
        dispatch(toggleHistory(!isHistoryDisplayed))
    }

    return (
        <>
            {!isButtonRendered && (
                <>
                    <Button
                        id={customerTimelineButtonId}
                        className={css.customerTimelineButtonWrapper}
                        intent="secondary"
                        onClick={handleCustomerTimelineButtonClick}
                        isDisabled={isHistoryDisabled}
                    >
                        <ButtonIconLabel
                            icon={
                                isHistoryDisplayed
                                    ? 'close'
                                    : 'format_list_bulleted'
                            }
                        >
                            {isHistoryDisplayed
                                ? 'Close timeline'
                                : 'Customer timeline'}
                        </ButtonIconLabel>
                    </Button>
                    {isHistoryDisabled && (
                        <Tooltip
                            target={customerTimelineButtonId}
                            placement={'bottom-start'}
                            offset="0, 4"
                        >
                            This customer does not have any other events
                        </Tooltip>
                    )}
                </>
            )}
        </>
    )
}
