import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'

import { CustomizeTranslationsButton } from '../CustomizeTranslationsButton'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<CustomizeTranslationButton />', () => {
    const integrationId = 123

    it('should match snapshot', () => {
        const { container } = render(
            <Router>
                <CustomizeTranslationsButton integrationId={integrationId} />
            </Router>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should navigate to the correct URL when clicked', () => {
        const { getByText } = render(
            <Router>
                <CustomizeTranslationsButton integrationId={integrationId} />
            </Router>,
        )

        fireEvent.click(getByText('Customize Translations'))

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/settings/channels/gorgias_chat/${integrationId}/languages`,
        )
    })
})
