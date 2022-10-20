import classnames from 'classnames'
import React, {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {fromJS, Map} from 'immutable'
import HistoryButton from 'pages/tickets/detail/components/HistoryButton'
import TicketHeader from 'pages/tickets/detail/components/TicketHeader'
import useAppSelector from 'hooks/useAppSelector'
import {getDisplayHistory} from 'state/ticket/selectors'
import {getCustomersState, makeIsLoading} from 'state/customers/selectors'
import {AgentLabel} from 'pages/common/utils/labels'
import {
    getOtherAgentsOnTicket,
    getOtherAgentsTypingOnTicket,
} from 'state/agents/selectors'
import {FeatureFlagKey} from 'config/featureFlags'

import css from './TicketHeaderWrapper.less'

const CollisionDetection = () => {
    const agentsViewing =
        useAppSelector((state) =>
            getOtherAgentsOnTicket(state.ticket.get('id'))(state)
        ) || fromJS([])
    const agentsTyping =
        useAppSelector((state) =>
            getOtherAgentsTypingOnTicket(state.ticket.get('id'))(state)
        ) || fromJS([])

    const agentsViewingNotTyping = useMemo(
        () => agentsViewing.filter((userId) => !agentsTyping.contains(userId)),
        [agentsViewing, agentsTyping]
    )
    const hasBoth = useMemo(
        () => agentsTyping.size > 0 && agentsViewingNotTyping.size > 0,
        [agentsTyping, agentsViewingNotTyping]
    )

    return (
        <div
            className={classnames(css.viewersBanner, {
                [css.hidden]: agentsViewing.size <= 0 && agentsTyping.size <= 0,
                [css.bothCollisions]: hasBoth,
            })}
        >
            {
                // we want to hide text during animation if there is no agents viewing
                agentsTyping.size > 0 && (
                    <div className={css.collisionCategory}>
                        <i className={classnames(css.icon, 'material-icons')}>
                            mode_edit
                        </i>

                        <div className={css.collisionLabel}>Typing:</div>

                        {agentsTyping.map((agent, index) => (
                            <AgentLabel
                                key={index}
                                name={(agent as Map<any, any>).get('name')}
                                profilePictureUrl={(
                                    agent as Map<any, any>
                                ).getIn(['meta', 'profile_picture_url'])}
                                className={css.collisionAgent}
                                shouldDisplayAvatar
                            />
                        ))}
                    </div>
                )
            }
            {
                // we want to hide text during animation if there is no agents viewing
                agentsViewingNotTyping.size > 0 && (
                    <div className={css.collisionCategory}>
                        <i className={classnames(css.icon, 'material-icons')}>
                            remove_red_eye
                        </i>

                        <div className={css.collisionLabel}>Viewing:</div>

                        {agentsViewingNotTyping.map((agent, index) => (
                            <AgentLabel
                                key={index}
                                name={(agent as Map<any, any>).get('name')}
                                profilePictureUrl={(
                                    agent as Map<any, any>
                                ).getIn(['meta', 'profile_picture_url'])}
                                className={css.collisionAgent}
                                shouldDisplayAvatar
                            />
                        ))}
                    </div>
                )
            }
        </div>
    )
}

type Props = {
    hideTicket: () => Promise<void>
    handleHistoryToggle: () => void
}

const TicketHeaderWrapper = ({hideTicket, handleHistoryToggle}: Props) => {
    // TODO: refactor after Virtualization is rolled out
    const isVirtualizationEnabled =
        useFlags()[FeatureFlagKey.TicketMessagesVirtualization]

    const ticket = useAppSelector((state) => state.ticket)
    const customers = useAppSelector(getCustomersState)
    const isHistoryDisplayed = useAppSelector(getDisplayHistory)
    const customersIsLoading = useAppSelector(makeIsLoading)

    const isExistingTicket = !!ticket.get('id')
    const hideHistoryButton = !ticket.get('id')
    const customerHistory = useMemo(
        () => (customers.get('customerHistory') as Map<any, any>) || fromJS({}),
        [customers]
    )

    return (
        <>
            <div
                className={classnames(css.headerContainer, {
                    [css.isVirtualized]: isVirtualizationEnabled,
                })}
            >
                <div className="d-flex">
                    {!hideHistoryButton && (
                        <div
                            className={classnames(
                                css.historyButtonContainer,
                                'd-none d-md-flex align-items-top mt-4'
                            )}
                        >
                            <HistoryButton
                                isHistoryDisplayed={isHistoryDisplayed}
                                customerHistory={customerHistory}
                                toggleHistory={handleHistoryToggle}
                                ticket={ticket}
                                customersIsLoading={customersIsLoading}
                            />
                        </div>
                    )}
                    <TicketHeader
                        ticket={ticket}
                        hideTicket={hideTicket}
                        className="flex-grow"
                    />
                </div>
                <CollisionDetection />
            </div>
            {isExistingTicket && isVirtualizationEnabled && (
                <div style={{height: 16}} />
            )}
        </>
    )
}

export default TicketHeaderWrapper
