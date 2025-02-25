import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockStore } from 'utils/testing'

import DEPRECATED_HelpCenterFilter from './DEPRECATED_HelpCenterFilter'

const helpCenters = getHelpCentersResponseFixture.data

const renderComponent = (
    props: Partial<ComponentProps<typeof DEPRECATED_HelpCenterFilter>>,
) => {
    render(
        <Provider store={mockStore({} as any)}>
            <DEPRECATED_HelpCenterFilter
                helpCenters={[]}
                selectedHelpCenter={helpCenters[0]}
                setSelectedHelpCenter={jest.fn}
                {...props}
            />
        </Provider>,
    )
}

describe('<HelpCenterFilter />', () => {
    it('should render component', () => {
        renderComponent({ selectedHelpCenter: helpCenters[0] })

        expect(screen.getByText(helpCenters[0].name)).toBeInTheDocument()
    })

    it('should render with initial filter', () => {
        const helpCenters = getHelpCentersResponseFixture.data

        renderComponent({
            helpCenters,
            selectedHelpCenter: helpCenters[0],
        })

        expect(screen.getByRole('button')).toHaveTextContent(
            helpCenters[0].name,
        )
    })

    it('should call change filter function with correct params', () => {
        const mockSetSelectedHelpCenter = jest.fn()
        const helpCenters = getHelpCentersResponseFixture.data

        renderComponent({
            setSelectedHelpCenter: mockSetSelectedHelpCenter,
            helpCenters,
        })

        userEvent.click(screen.getByText(helpCenters[0].name))

        userEvent.click(screen.getByText(helpCenters[1].name))

        expect(mockSetSelectedHelpCenter).toHaveBeenCalledWith({
            helpCenters: [helpCenters[1].id],
        })
    })
})
