import {render} from '@testing-library/react'
import React from 'react'

import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'

import NoChannelsAlert from '../NoChannelAlert'
import {ChannelConfig} from '../utils'

describe('NoChannelsAlert Component', () => {
    Object.entries(ChannelConfig).forEach(([channelType, config]) => {
        it(`renders alert for ${config.label} channel with correct settings`, () => {
            const {getByText} = render(
                <NoChannelsAlert
                    channelType={channelType as SelfServiceChannelType}
                    showLabel={true}
                />
            )
            const linkElement = getByText(config.linkText)
            expect(linkElement).toBeInTheDocument()
            expect(getByText(config.description.trim())).toBeInTheDocument()
            expect(getByText(config.label.trim())).toBeInTheDocument()
        })
    })
    Object.entries(ChannelConfig).forEach(([channelType, config]) => {
        it(`renders alert for ${config.label} channel with correct settings`, () => {
            const {getByText, queryByText} = render(
                <NoChannelsAlert
                    channelType={channelType as SelfServiceChannelType}
                    showLabel={false}
                />
            )
            const linkElement = getByText(config.linkText)
            expect(linkElement).toBeInTheDocument()
            expect(getByText(config.description.trim())).toBeInTheDocument()
            expect(
                queryByText(config.label, {
                    exact: true,
                })
            ).not.toBeInTheDocument()
        })
    })
})
