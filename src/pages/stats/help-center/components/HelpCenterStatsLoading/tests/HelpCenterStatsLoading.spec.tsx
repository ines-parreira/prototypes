import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import HelpCenterStatsLoading from '../HelpCenterStatsLoading'

jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

const renderComponent = (
    props: Partial<ComponentProps<typeof HelpCenterStatsLoading>>,
) => {
    render(<HelpCenterStatsLoading title="" {...props} />)
}

describe('<HelpCenterStatsLoading />', () => {
    it('should render with title', () => {
        renderComponent({ title: 'Test title' })

        expect(screen.getByText('Test title')).toBeInTheDocument()
    })
})
