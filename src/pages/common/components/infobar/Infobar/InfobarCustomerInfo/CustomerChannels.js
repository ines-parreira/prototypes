import React, {type Node} from 'react'
import {fromJS, type List, type Map} from 'immutable'
import classnames from 'classnames'

import {
    CHAT_CUSTOMER_CHANNEL_TYPE,
    EMAIL_CUSTOMER_CHANNEL_TYPE,
    FACEBOOK_CUSTOMER_CHANNEL_TYPE,
    INSTAGRAM_CUSTOMER_CHANNEL_TYPE,
    PHONE_CUSTOMER_CHANNEL_TYPE,
    TWITTER_CUSTOMER_CHANNEL_TYPE,
    FACEBOOK_RECOMMENDATIONS_CUSTOMER_CHANNEL_TYPE,
} from '../../../../../../constants/user.ts'
import SourceIcon from '../../../SourceIcon'
import Tooltip from '../../../Tooltip'
import css from '../../Infobar.less'
import {getLocalTime} from '../../utils'

import CustomerInfoWrapper from './CustomerInfoWrapper.tsx'

type Props = {
    channels: List<Map<*, *>>,
    customerLocationInfo: Map<any, any>,
    children: Node,
}

export default class CustomerChannels extends React.Component<Props> {
    static defaultProps = {
        customerLocationInfo: fromJS({}),
    }

    render() {
        const {channels, children, customerLocationInfo} = this.props

        let filteredChannels = channels
            .filter((channel) => {
                // hide chats and facebook
                return ![
                    CHAT_CUSTOMER_CHANNEL_TYPE,
                    FACEBOOK_CUSTOMER_CHANNEL_TYPE,
                    FACEBOOK_RECOMMENDATIONS_CUSTOMER_CHANNEL_TYPE,
                    INSTAGRAM_CUSTOMER_CHANNEL_TYPE,
                ].includes(channel.get('type'))
            })
            .sortBy((channel) => channel.get('address', '').toLowerCase()) // order addresses alphabetically
            .sortBy((channel) => -channel.get('preferred')) // put preferred addresses on top
            .sortBy((channel) => channel.get('type')) // group by channel type

        const country = customerLocationInfo.get('country_name')
        const city = customerLocationInfo.get('city')
        const timezoneOffset = customerLocationInfo.getIn([
            'time_zone',
            'offset',
        ])

        const list = filteredChannels.map((channel, idx) => {
            let props = null
            let addressComponent = null
            const channelType = channel.get('type')
            const channelAddress = channel.get('address') || ''

            if (!channelAddress) {
                return null
            }

            switch (channelType) {
                case EMAIL_CUSTOMER_CHANNEL_TYPE:
                    props = {
                        href: `mailto:${channelAddress}`,
                    }
                    break
                case TWITTER_CUSTOMER_CHANNEL_TYPE:
                    props = {
                        href: `https://twitter.com/${channelAddress}`,
                        target: '_blank',
                    }
                    break
                case PHONE_CUSTOMER_CHANNEL_TYPE:
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

            const componentId = `address-copied-${channel.get('id')}`

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
                        <i id={`copy-icon-${idx}`} className="material-icons">
                            content_copy
                        </i>
                        <Tooltip
                            placement="top"
                            target={`copy-icon-${idx}`}
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
                </CustomerInfoWrapper>
            </>
        )
    }
}
