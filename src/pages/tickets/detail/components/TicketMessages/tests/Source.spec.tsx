// sort-imports-ignore
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { omit } from 'lodash'
import moment from 'moment'

import { TicketMessageSourceType } from 'business/types/ticket'
import { channels as mockChannels } from 'fixtures/channels'
import { channelsQueryKeys as mockChannelsQueryKeys } from 'models/channel/queries'
import { Source as MessageSource } from 'models/ticket/types'

import Source from '../Source'

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({ dateTime }: { dateTime: string }) => <div>{dateTime}</div>,
)

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [[mockChannelsQueryKeys.list(), mockChannels]],
    }),
}))

const minProps = {
    createdDatetime: moment('2017-12-22').toString(),
    id: 'foo',
    isForwarded: false,
    source: {
        type: TicketMessageSourceType.Email,
        to: [{ name: 'Marie Curie', address: 'marie@gorgias.io' }],
        cc: [
            { name: 'Marie Curie', address: 'marie@gorgias.io' },
            { name: 'Gorgias Bot', address: 'support@acme.gorgias.io' },
        ],
        from: {
            name: 'Acme Support',
            address: 'zp7d01g9zorymjke@foo.gorgi.us',
        },
        extra: { include_thread: false },
    },
}

describe('<Source />', () => {
    it('should render a source', () => {
        const { container } = render(<Source {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the tooltip on hover', async () => {
        const { getByText, findByText } = render(<Source {...minProps} />)

        fireEvent.mouseOver(getByText('email'))
        const tooltipElement = await findByText(/From/i)

        expect(tooltipElement.parentElement?.parentElement).toMatchSnapshot()
    })

    it('should fallback to message channel if source.type is empty', () => {
        const { container } = render(
            <Source
                {...minProps}
                source={omit(minProps.source, 'type') as MessageSource}
                channel="tiktok-shop"
            />,
        )

        expect(
            container.querySelector('img[alt="TikTok Shop"]'),
        ).toBeInTheDocument()
    })

    it('should display source information in a tooltip', async () => {
        const { getByText, findByText } = render(<Source {...minProps} />)

        fireEvent.mouseOver(getByText('email'))
        await findByText('From:')

        expect(getByText('From:')).toBeInTheDocument()
        expect(getByText('To:')).toBeInTheDocument()
        expect(getByText('Channel:')).toBeInTheDocument()
        expect(getByText('Date:')).toBeInTheDocument()
        expect(
            getByText('Acme Support (zp7d01g9zorymjke@foo.gorgi.us)'),
        ).toBeInTheDocument()
        expect(getByText('Marie Curie (marie@gorgias.io)')).toBeInTheDocument()
        expect(
            getByText(
                'Marie Curie (marie@gorgias.io), Gorgias Bot (support@acme.gorgias.io)',
            ),
        ).toBeInTheDocument()
        expect(getByText('Email')).toBeInTheDocument()
    })

    it('should use the channel name for new channels', async () => {
        const { container, getByText, findByText } = render(
            <Source
                {...minProps}
                source={omit(minProps.source, 'type') as MessageSource}
                channel="tiktok-shop"
            />,
        )

        fireEvent.mouseOver(container.querySelector('img[alt="TikTok Shop"]')!)
        await findByText('Channel:')

        expect(getByText('TikTok Shop')).toBeInTheDocument()
    })
})
