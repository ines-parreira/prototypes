import moment from 'moment'
import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'

import Source from '../Source'
import {TicketMessageSourceType} from '../../../../../../business/types/ticket'
import {DatetimeLabel} from '../../../../../common/utils/labels'

jest.mock('../../../../../common/utils/labels', () => ({
    DatetimeLabel: ({dateTime}: ComponentProps<typeof DatetimeLabel>) => {
        return <div>{dateTime}</div>
    },
}))

const minProps = {
    createdDatetime: moment('2017-12-22').toString(),
    id: 'foo',
    isForwarded: false,
    source: {
        type: TicketMessageSourceType.Email,
        to: [{name: 'Marie Curie', address: 'marïe@gorgias.io'}],
        cc: [
            {name: 'Marie Curie', address: 'marïe@gorgias.io'},
            {name: 'Gorgias Bot', address: 'support@acme.gorgias.io'},
        ],
        from: {
            name: 'Acme Support',
            address: 'zp7d01g9zorymjke@foo.gorgi.us',
        },
        extra: {include_thread: false},
    },
}

describe('<Source />', () => {
    it('should render a source', () => {
        const {container} = render(<Source {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the tooltip on hover', async () => {
        const {getByText, findByText} = render(<Source {...minProps} />)

        fireEvent.mouseOver(getByText('email'))
        const tooltipElement = await findByText(/From/i)

        expect(tooltipElement.parentElement?.parentElement).toMatchSnapshot()
    })
})
