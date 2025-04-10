import React from 'react'

import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SmsIntegration } from 'models/integration/types'

import SmsIntegrationSelect from '../SmsIntegrationSelect'

describe('<SmsIntegrationSelect />', () => {
    const mockOnChange = jest.fn()
    const renderComponent = (
        smsIntegrations: undefined | SmsIntegration[] = undefined,
        selectedIntegration = 1,
    ) => {
        const integrations =
            smsIntegrations ??
            ([
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
            ] as SmsIntegration[])

        return render(
            <SmsIntegrationSelect
                options={integrations}
                value={selectedIntegration}
                onChange={mockOnChange}
            />,
        )
    }

    it('should render', () => {
        const { getByText } = renderComponent()

        expect(getByText('TEST SMS INTEGRATION')).toBeInTheDocument()
    })

    it('should select option', () => {
        const { getAllByText, getByText } = renderComponent([
            {
                id: 1,
                name: 'test 1',
            },
            {
                id: 2,
                name: 'test 2',
            },
        ] as SmsIntegration[])

        act(() => {
            userEvent.click(getByText('arrow_drop_down'))
        })

        expect(getAllByText('test 1')).toHaveLength(2) // 1 for the label and 1 for the dropdown
        expect(getByText('test 2')).toBeInTheDocument()

        act(() => {
            userEvent.click(getByText('test 2'))
        })

        expect(mockOnChange).toHaveBeenCalledWith(2)
    })
})
