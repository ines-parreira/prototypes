import React from 'react'

import { render } from '@testing-library/react'

import TicketListInfo from '../TicketListInfo'

describe('TicketListInfo', () => {
    it('should render', () => {
        const { queryByText } = render(
            <TicketListInfo text="title" subText="subtitle" />,
        )
        expect(queryByText('title')).toBeInTheDocument()
        expect(queryByText('subtitle')).toBeInTheDocument()
    })

    it('should allow passing an action node', () => {
        const { queryByText } = render(
            <TicketListInfo
                text="title"
                subText="subtitle"
                action={<button>action</button>}
            />,
        )

        expect(queryByText('action')).toBeInTheDocument()
    })
})
