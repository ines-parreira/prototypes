import React from 'react'
import {fromJS} from 'immutable'
import {channels as mockChannels} from 'fixtures/channels'
import {renderWithStore} from 'utils/testing'

import SelectTargetTicket from 'pages/common/components/MergeTickets/SelectTargetTicket'

jest.mock('services/channels', () => ({
    getChannels: () => mockChannels,
}))

describe('SelectTargetTicket component', () => {
    const baseTicket = fromJS({
        subject: 'foo',
        assignee_user: {
            id: 1,
            name: 'John Smith',
        },
        customer: {
            id: 22,
            name: 'Maria Curie',
        },
    })

    it('should render', () => {
        const {container} = renderWithStore(
            <SelectTargetTicket
                sourceTicket={baseTicket}
                updateTargetTicket={baseTicket}
                customerId={123}
            />,
            {}
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
