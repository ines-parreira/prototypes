import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import userEvent from '@testing-library/user-event'
import {mockStore} from 'utils/testing'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import DEPRECATED_HelpCenterStatsLanguageFilter from 'pages/stats/common/filters/HelpCenterStatsLanguageFilter/DEPRECATED_HelpCenterStatsLanguageFilter'

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: jest.fn(),
}))

const mockUseSupportedLocales = jest.mocked(useSupportedLocales)

const renderComponent = (
    props: Partial<
        ComponentProps<typeof DEPRECATED_HelpCenterStatsLanguageFilter>
    >
) => {
    render(
        <Provider store={mockStore({} as any)}>
            <DEPRECATED_HelpCenterStatsLanguageFilter
                supportedLocales={[]}
                selectedLocaleCodes={[]}
                onFilterChange={jest.fn()}
                {...props}
            />
        </Provider>
    )
}

describe('<HelpCenterStatsLanguageFilter />', () => {
    beforeEach(() => {
        mockUseSupportedLocales.mockReturnValue([])
    })
    it('should render component', () => {
        mockUseSupportedLocales.mockReturnValue([
            {code: 'en-US', name: 'English'},
        ])
        renderComponent({supportedLocales: ['en-US']})

        expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should call change filter function with correct params', () => {
        const mockOnFilterChange = jest.fn()
        mockUseSupportedLocales.mockReturnValue([
            {code: 'en-US', name: 'English'},
            {code: 'fr-FR', name: 'French'},
        ])

        renderComponent({
            supportedLocales: ['en-US', 'fr-FR'],
            onFilterChange: mockOnFilterChange,
        })

        userEvent.click(screen.getByText('English'))

        expect(mockOnFilterChange).toHaveBeenCalledWith(['en-US'])
    })
})
