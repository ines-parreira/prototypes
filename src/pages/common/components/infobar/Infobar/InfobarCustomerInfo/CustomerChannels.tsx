import React, {Component, ReactNode} from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'

import SourceIcon from '../../../SourceIcon'
import Tooltip from '../../../Tooltip'
import css from '../../Infobar.less'
import {getLocalTime} from '../../utils'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../../../../../business/types/ticket'

import ClickablePhoneNumber from '../../../ClickablePhoneNumber/ClickablePhoneNumber'

import CustomerInfoWrapper from './CustomerInfoWrapper'

type Props = {
    channels: List<any>
    customerLocationInfo: Map<any, any>
    customerLastSeenOnChat: number | null
    customerId: string
    customerName: string
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
            customerId,
            customerName,
        } = this.props

        const filteredChannels = channels
            .filter((channel: Map<any, any>) => {
                // hide chats and facebook
                return ![
                    TicketMessageSourceType.Chat,
                    TicketMessageSourceType.Facebook,
                    TicketMessageSourceType.Instagram,
                    TicketMessageSourceType.InstagramDirectMessage,
                    TicketChannel.Twitter,
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
            let addressComponent = null
            const channelType = channel.get('type')
            const componentId = `address-copied-${channel.get('id') as number}`
            const channelAddress = (channel.get('address') as string) || ''

            if (!channelAddress) {
                return null
            }

            switch (channelType) {
                case TicketChannel.Email:
                    addressComponent = (
                        <a id={componentId} href={`mailto:${channelAddress}`}>
                            {channelAddress}
                        </a>
                    )
                    break
                case TicketChannel.Phone:
                    addressComponent = (
                        <ClickablePhoneNumber
                            id={componentId}
                            address={channelAddress}
                            customerId={customerId}
                            customerName={customerName}
                        />
                    )
                    break
                default:
                    addressComponent = (
                        <span id={componentId}>{channelAddress}</span>
                    )
                    break
            }

            return (
                <div key={idx} className={css.customerChannel}>
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
                </div>
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
                </CustomerInfoWrapper>
            </>
        )
    }
}

const connector = connect(null)

export default connector(CustomerChannels)
