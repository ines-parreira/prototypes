import {fromJS} from 'immutable'
import React from 'react'

import {channels as mockChannels} from 'fixtures/channels'
import SelectTargetTicket from 'pages/common/components/MergeTickets/SelectTargetTicket'
import {renderWithStore} from 'utils/testing'

jest.mock('services/channels', () => ({
    getChannels: () => mockChannels,
}))

jest.mock('@gorgias/realtime', () => ({
    useAgentActivity: () => ({
        viewTickets: jest.fn(),
    }),
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
