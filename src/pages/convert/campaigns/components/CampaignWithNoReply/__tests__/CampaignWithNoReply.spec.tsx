import React from 'react'

import { render } from '@testing-library/react'

import { CampaignWithNoReply } from '../CampaignWithNoReply'

describe('CampaignWithNoReply', () => {
    it('should render correctly', () => {
        const { getByText } = render(
            <CampaignWithNoReply value={false} onChange={jest.fn()} />,
        )

        expect(
            getByText('Customers can reply to this campaign'),
        ).toBeInTheDocument()
    })

    it('should render correctly when value is true', () => {
        const { getByRole, rerender } = render(
            <CampaignWithNoReply value={true} onChange={jest.fn()} />,
        )

        const toggle = getByRole('switch')
        expect(toggle.getAttribute('aria-checked')).toBe('false')

        rerender(<CampaignWithNoReply value={false} onChange={jest.fn()} />)

        expect(toggle.getAttribute('aria-checked')).toBe('true')
    })

    it('should call onChange when toggle is clicked', () => {
        const onChange = jest.fn()

        const { getByRole } = render(
            <CampaignWithNoReply value={false} onChange={onChange} />,
        )

        getByRole('switch').click()

        expect(onChange).toHaveBeenCalledWith(true)
    })
})
