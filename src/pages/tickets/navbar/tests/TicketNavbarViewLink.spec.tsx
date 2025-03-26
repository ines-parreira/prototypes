import React from 'react'

import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { View } from 'models/view/types'

import TicketNavbarViewLink from '../TicketNavbarViewLink'

// Minimal mocks for hooks that are not needed for testing the candu link
jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: () => ({ isEnabled: false }),
}))

jest.mock('hooks/useViewId', () => () => 'view1')
jest.mock(
    'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView',
    () => () => {},
)
jest.mock('hooks/useAppDispatch', () => () => jest.fn())

describe('<TicketNavbarViewLink /> - candu link part', () => {
    it('renders the candu link with the correct data-candu-id attribute', () => {
        // Create a minimal view object for testing
        const view = {
            id: 'view1',
            name: 'Handover',
            slug: 'handover',
            decoration: { emoji: '🧑‍💻' },
            section_id: null,
            deactivated_datetime: null,
        } as unknown as View

        const { container } = render(
            <MemoryRouter>
                <TicketNavbarViewLink view={view} viewCount={5} />
            </MemoryRouter>,
        )

        const expectedDataCanduId = 'ticket-navbar-ai-agent-view-link-handover'

        const sectionNameElement = container.querySelector('[data-candu-id]')
        expect(sectionNameElement).toBeTruthy()

        expect(sectionNameElement).toHaveAttribute(
            'data-candu-id',
            expectedDataCanduId,
        )
    })
})
