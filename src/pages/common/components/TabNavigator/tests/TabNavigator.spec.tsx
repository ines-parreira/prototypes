import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import { flushPromises } from 'utils/testing'

import TabNavigator from '../TabNavigator'

describe('<TabNavigator />', () => {
    const defaultProps: ComponentProps<typeof TabNavigator> = {
        tabs: [
            { label: 'Tab One', value: 'one' },
            { label: 'Tab Two', value: 'two' },
        ],
        activeTab: 'one',
        onTabChange: jest.fn(),
    }

    it('should render', async () => {
        const { container } = render(<TabNavigator {...defaultProps} />)
        await flushPromises()
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle tab focus', () => {
        const { getByText } = render(<TabNavigator {...defaultProps} />)
        getByText('Tab Two').parentElement!.focus()

        expect(defaultProps.onTabChange).toHaveBeenCalledWith('two')
    })

    it('should scroll the new active tab into view', () => {
        const { rerender, getByText } = render(
            <TabNavigator {...defaultProps} />,
        )
        rerender(<TabNavigator {...defaultProps} activeTab="two" />)

        expect(getByText('Tab Two').scrollIntoView).toHaveBeenCalled()
    })
})
