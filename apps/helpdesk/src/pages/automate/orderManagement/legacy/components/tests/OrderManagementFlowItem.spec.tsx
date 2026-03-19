import React from 'react'

import { render, screen } from '@testing-library/react'

import OrderManagementFlowItem from '../OrderManagementFlowItem'

describe('<OrderManagementFlowItem />', () => {
    it('should render component', () => {
        render(
            <OrderManagementFlowItem
                isEnabled
                onChange={jest.fn()}
                title="title"
                description="description"
            />,
        )

        expect(screen.getByText('title')).toBeInTheDocument()
    })
})
