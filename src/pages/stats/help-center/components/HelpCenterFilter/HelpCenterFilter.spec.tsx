import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import userEvent from '@testing-library/user-event'
import {mockStore} from 'utils/testing'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import HelpCenterFilter from './HelpCenterFilter'

const renderComponent = (
    props: Partial<ComponentProps<typeof HelpCenterFilter>>
) => {
    render(
        <Provider store={mockStore({} as any)}>
            <HelpCenterFilter
                helpCenters={[]}
                selectedHelpCenterIds={[]}
                setSelectedHelpCenter={jest.fn}
                {...props}
            />
        </Provider>
    )
}

describe('<HelpCenterFilter />', () => {
    it('should render component', () => {
        renderComponent({})

        expect(screen.getByText('Select help center')).toBeInTheDocument()
    })

    it('should render with initial filter', () => {
        const helpCenters = getHelpCentersResponseFixture.data

        renderComponent({
            helpCenters,
            selectedHelpCenterIds: [helpCenters[0].id],
        })

        expect(screen.getByRole('button')).toHaveTextContent(
            helpCenters[0].name
        )
    })

    it('should call change filter function with correct params', () => {
        const mockSetSelectedHelpCenter = jest.fn()
        const helpCenters = getHelpCentersResponseFixture.data

        renderComponent({
            setSelectedHelpCenter: mockSetSelectedHelpCenter,
            helpCenters,
        })

        userEvent.click(screen.getByText('Select help center'))

        userEvent.click(screen.getByText(helpCenters[0].name))

        expect(mockSetSelectedHelpCenter).toHaveBeenCalledWith('helpCenters', {
            helpCenters: [helpCenters[0].id],
        })
    })
})
