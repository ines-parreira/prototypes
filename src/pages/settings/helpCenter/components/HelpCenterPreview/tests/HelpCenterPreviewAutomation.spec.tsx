import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import HelpCenterPreviewAutomation from '../HelpCenterPreviewAutomation'

const renderComponent = (
    props: ComponentProps<typeof HelpCenterPreviewAutomation>
) => {
    render(<HelpCenterPreviewAutomation {...props} />)
}

describe('<HelpCenterPreviewAutomation />', () => {
    it('should render flows and order management', () => {
        const flows = [
            'Submit a product idea',
            'Get replacement parts with long name included in this string',
        ]
        const orderManagement = [
            'report_issue_policy',
            'track_order_policy',
            'cancel_order_policy',
            'return_order_policy',
        ] as const

        renderComponent({flows, orderManagement})

        flows.forEach((flow) => {
            expect(screen.getByText(flow)).toBeInTheDocument()
        })

        expect(screen.getByText('Return')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Report Issue')).toBeInTheDocument()
        expect(screen.getByText('Track')).toBeInTheDocument()
    })
})
