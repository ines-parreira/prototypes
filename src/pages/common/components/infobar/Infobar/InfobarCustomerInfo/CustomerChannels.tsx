import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import React, {ReactNode} from 'react'

import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {useFlag} from 'common/flags'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {DateAndTimeFormatting} from 'constants/datetime'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppSelector from 'hooks/useAppSelector'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import ClickablePhoneNumber from 'pages/common/components/ClickablePhoneNumber/ClickablePhoneNumber'
import SourceIcon from 'pages/common/components/SourceIcon'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import {CUSTOM_FIELD_ROUTES} from 'routes/constants'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isAdmin} from 'utils'

import css from '../../Infobar.less'
import {getLocalTime} from '../../utils'
import CustomerInfoWrapper from './CustomerInfoWrapper'
import NewPhoneNumber from './NewPhoneNumber'

type OwnProps = {
    channels: List<any>
    customerLocationInfo: Map<any, any>
    customerLastSeenOnChat: number | null
    customerId: string
    customerName: string
    children?: ReactNode
}

export const CustomerChannels = ({
    channels,
    customerLocationInfo = fromJS({}),
    customerId,
    customerName,
    children,
}: OwnProps) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.TimeDoubleDigitHour
    )

    const currentUser = useAppSelector(getCurrentUser)
    const userIsAdmin = isAdmin(currentUser)

    const isCustomerFieldsEnabled = useFlag(
        FeatureFlagKey.CustomerFields,
        false
    )
    const customFields = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.CUSTOMER,
    })

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
    const timezoneOffset = customerLocationInfo.getIn(['time_zone', 'offset'])

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

    const handleAddCustomerFields = () => {
        logEvent(SegmentEvent.CustomFieldCustomerAddFieldsClicked)
    }

    return (
        <>
            {children}
            <CustomerInfoWrapper>
                {list}
                <NewPhoneNumber customerId={Number(customerId)} />

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
                        {`Local time: ${getLocalTime(
                            timezoneOffset,
                            datetimeFormat
                        )}`}
                    </p>
                )}

                {isCustomerFieldsEnabled && !customFields.data?.data.length && (
                    <p className={css.customerChannel}>
                        <i
                            className={classnames(
                                'icon d-inline-block',
                                'material-icons',
                                'uncolored mr-2'
                            )}
                        >
                            person
                        </i>
                        {userIsAdmin ? (
                            <a
                                href={`/app/settings/${
                                    CUSTOM_FIELD_ROUTES[OBJECT_TYPES.CUSTOMER]
                                }/add`}
                                onClick={handleAddCustomerFields}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="uncolored"
                            >
                                Add Customer Fields
                                <i className="material-icons ml-2">
                                    open_in_new
                                </i>
                            </a>
                        ) : (
                            <>
                                <span className={css.disabledChannel}>
                                    Customer Fields
                                </span>
                                <IconTooltip className="d-inline-block ml-2">
                                    Add customer attributes here.
                                    <br />
                                    Reach out to your admin for setup.
                                </IconTooltip>
                            </>
                        )}
                    </p>
                )}
            </CustomerInfoWrapper>
        </>
    )
}

export default CustomerChannels
