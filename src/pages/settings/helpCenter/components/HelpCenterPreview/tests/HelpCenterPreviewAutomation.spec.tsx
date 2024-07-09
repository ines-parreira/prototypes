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
            {name: 'Submit a product idea', id: '1'},
            {
                name: 'Get replacement parts with long name included in this string',
                id: '2',
            },
        ]
        const orderManagement = [
            'reportIssuePolicy',
            'trackOrderPolicy',
            'cancelOrderPolicy',
            'returnOrderPolicy',
        ] as const

        renderComponent({flows, orderManagement})

        flows.forEach((flow) => {
            expect(screen.getByText(flow.name)).toBeInTheDocument()
        })

        expect(screen.getByText('Return')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Report Issue')).toBeInTheDocument()
        expect(screen.getByText('Track')).toBeInTheDocument()
    })
})
