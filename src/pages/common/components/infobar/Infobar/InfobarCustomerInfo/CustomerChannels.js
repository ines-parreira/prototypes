import React from 'react'
import {type List, type Map} from 'immutable'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import {
    CHAT_CUSTOMER_CHANNEL_TYPE, EMAIL_CUSTOMER_CHANNEL_TYPE,
    FACEBOOK_CUSTOMER_CHANNEL_TYPE,
    INSTAGRAM_CUSTOMER_CHANNEL_TYPE, PHONE_CUSTOMER_CHANNEL_TYPE, TWITTER_CUSTOMER_CHANNEL_TYPE
} from '../../../../../../constants/user'
import SourceIcon from '../../../SourceIcon'
import Tooltip from '../../../Tooltip'
import css from '../../Infobar.less'


const DEFAULT_COUNT_DISPLAYED_CUSTOMER_CHANNELS = 2


type Props = {
    channels: List<Map<*,*>>
}

type State = {
    displayAllCustomerChannels: boolean
}

export default class CustomerChannels extends React.Component<Props, State> {
    state = {
        displayAllCustomerChannels: false
    }

    _displayAllCustomerChannels = () => {
        this.setState({displayAllCustomerChannels: true})
    }

    render() {
        const {channels} = this.props
        const {displayAllCustomerChannels} = this.state

        let filteredChannels = channels
            .filter((channel) => { // hide chats and facebook
                return ![CHAT_CUSTOMER_CHANNEL_TYPE, FACEBOOK_CUSTOMER_CHANNEL_TYPE, INSTAGRAM_CUSTOMER_CHANNEL_TYPE]
                    .includes(channel.get('type'))
            })
            .sortBy((channel) => channel.get('address', '').toLowerCase()) // order addresses alphabetically
            .sortBy((channel) => -channel.get('preferred')) // put preferred addresses on top
            .sortBy((channel) => channel.get('type')) // group by channel type

        const hasMoreChannels = !displayAllCustomerChannels
            && filteredChannels.size > DEFAULT_COUNT_DISPLAYED_CUSTOMER_CHANNELS

        if (!displayAllCustomerChannels) {
            filteredChannels = filteredChannels.take(DEFAULT_COUNT_DISPLAYED_CUSTOMER_CHANNELS)
        }

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
                        href: `mailto:${channelAddress}`
                    }
                    break
                case TWITTER_CUSTOMER_CHANNEL_TYPE:
                    props = {
                        href: `https://twitter.com/${channelAddress}`,
                        target: '_blank'
                    }
                    break
                case PHONE_CUSTOMER_CHANNEL_TYPE:
                    // remove dots and spaces so that some extensions recognize the address as a tel number
                    props = {
                        href: `tel:${channelAddress.replace(/\./g, '').replace(/ /g, '')}`
                    }
                    break
                default:
                    props = null
            }

            const componentId = `address-copied-${channel.get('id')}`

            if (props) {
                addressComponent = (
                    <a
                        {...props}
                        id={componentId}
                    >
                        {channelAddress}
                    </a>
                )
            } else {
                addressComponent = <span id={componentId}>{channelAddress}</span>
            }

            return (
                <p
                    key={idx}
                    className={css.customerChannel}
                >
                    <SourceIcon
                        type={channelType}
                        className="uncolored mr-2"
                    />
                    {addressComponent}
                    <span
                        className={classnames(css.copyAddress, 'ml-2 js-clipboard-copy')}
                        data-clipboard-target={`#${componentId}`}
                    >
                        <i
                            id={`copy-icon-${idx}`}
                            className="material-icons"
                        >
                            content_copy
                        </i>
                        <Tooltip
                            placement="top"
                            target={`copy-icon-${idx}`}
                            delay={{
                                show: 1000,
                                hide: 0
                            }}
                        >
                            Copy
                        </Tooltip>
                    </span>
                </p>
            )
        })

        return (
            <div>
                {list}
                {
                    hasMoreChannels && (
                        <Button
                            type="button"
                            color="link"
                            onClick={this._displayAllCustomerChannels}
                            className="pl-0 show-more"
                        >
                            Show more
                            <i className="material-icons md-2 ml-2">
                                arrow_drop_down
                            </i>
                        </Button>
                    )
                }
            </div>
        )
    }
}
