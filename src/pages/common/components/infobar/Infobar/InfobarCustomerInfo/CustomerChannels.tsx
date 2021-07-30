import React, {Component, ReactNode} from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'

import SourceIcon from '../../../SourceIcon'
import Tooltip from '../../../Tooltip'
import css from '../../Infobar.less'
import {getDisplayCustomerLastSeenOnChat, getLocalTime} from '../../utils'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../../../../../business/types/ticket'
import {RootState} from '../../../../../../state/types'
import {getCurrentUser} from '../../../../../../state/currentUser/selectors'

import CustomerInfoWrapper from './CustomerInfoWrapper'

type Props = {
    channels: List<any>
    customerLocationInfo: Map<any, any>
    customerLastSeenOnChat: number | null
    children: ReactNode
} & ConnectedProps<typeof connector>

export class CustomerChannels extends Component<Props> {
    static defaultProps: Pick<
        Props,
        'customerLocationInfo' | 'customerLastSeenOnChat'
    > = {
        customerLocationInfo: fromJS({}),
        customerLastSeenOnChat: null,
    }

    render() {
        const {
            channels,
            children,
            customerLocationInfo,
            customerLastSeenOnChat,
            currentUser,
        } = this.props

        const userSettingTimezone = currentUser.get('timezone')

        const filteredChannels = channels
            .filter((channel: Map<any, any>) => {
                // hide chats and facebook
                return ![
                    TicketMessageSourceType.Chat,
                    TicketMessageSourceType.Facebook,
                    TicketMessageSourceType.Instagram,
                    TicketMessageSourceType.InstagramDirectMessage,
                ].includes(channel.get('type'))
            })
            .sortBy((channel: Map<any, any>) =>
                (channel.get('address', '') as string).toLowerCase()
            ) // order addresses alphabetically
            .sortBy((channel: Map<any, any>) => -channel.get('preferred')) // put preferred addresses on top: ;
            .sortBy((channel: Map<any, any>) => channel.get('type') as string) // group by channel type

        const country = customerLocationInfo.get('country_name') as string
        const city = customerLocationInfo.get('city') as string
        const timezoneOffset = customerLocationInfo.getIn([
            'time_zone',
            'offset',
        ])

        const list = filteredChannels.map((channel: Map<any, any>, idx) => {
            let props = null
            let addressComponent = null
            const channelType = channel.get('type')
            let channelAddress = (channel.get('address') as string) || ''

            if (!channelAddress) {
                return null
            }

            switch (channelType) {
                case TicketChannel.Email:
                    props = {
                        href: `mailto:${channelAddress}`,
                    }
                    break
                case TicketChannel.Twitter:
                    // Display the twitter handle instead of the address
                    channelAddress = channel.getIn(['customer', 'name']) || ''

                    props = {
                        href: `https://twitter.com/${channelAddress}`,
                        target: '_blank',
                    }
                    break
                case TicketChannel.Phone:
                    // remove dots and spaces so that some extensions recognize the address as a tel number
                    props = {
                        href: `tel:${channelAddress
                            .replace(/\./g, '')
                            .replace(/ /g, '')}`,
                    }
                    break
                default:
                    props = null
            }

            const componentId = `address-copied-${channel.get('id') as number}`

            if (props) {
                addressComponent = (
                    <a {...props} id={componentId}>
                        {channelAddress}
                    </a>
                )
            } else {
                addressComponent = (
                    <span id={componentId}>{channelAddress}</span>
                )
            }

            return (
                <p key={idx} className={css.customerChannel}>
                    <SourceIcon type={channelType} className="uncolored mr-2" />
                    {addressComponent}
                    <span
                        className={classnames(
                            css.copyAddress,
                            'ml-2 js-clipboard-copy'
                        )}
                        data-clipboard-target={`#${componentId}`}
                    >
                        <i id={`copy-icon-${idx!}`} className="material-icons">
                            content_copy
                        </i>
                        <Tooltip
                            placement="top"
                            target={`copy-icon-${idx!}`}
                            delay={{
                                show: 1000,
                                hide: 0,
                            }}
                        >
                            Copy
                        </Tooltip>
                    </span>
                </p>
            )
        })

        return (
            <>
                {children}
                <CustomerInfoWrapper>
                    {list}
                    {(country || city) && (
                        <p className={css.customerChannel}>
                            <i
                                className={classnames(
                                    'icon d-inline-block',
                                    'material-icons',
                                    'uncolored mr-2'
                                )}
                            >
                                language
                            </i>
                            {`Location: ${
                                city && country
                                    ? `${city}, ${country}`
                                    : `${city || country}`
                            }`}
                        </p>
                    )}
                    {timezoneOffset && (
                        <p className={css.customerChannel}>
                            <i
                                className={classnames(
                                    'icon d-inline-block',
                                    'material-icons',
                                    'uncolored mr-2'
                                )}
                            >
                                access_time
                            </i>
                            {`Local time: ${getLocalTime(timezoneOffset)}`}
                        </p>
                    )}
                    {customerLastSeenOnChat && (
                        <p className={css.customerChannel}>
                            <i
                                className={classnames(
                                    'icon d-inline-block',
                                    'material-icons',
                                    'uncolored mr-2'
                                )}
                            >
                                event
                            </i>
                            {`Last seen on chat: ${getDisplayCustomerLastSeenOnChat(
                                customerLastSeenOnChat,
                                userSettingTimezone
                            )}`}
                        </p>
                    )}
                </CustomerInfoWrapper>
            </>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: getCurrentUser(state),
}))

export default connector(CustomerChannels)
