import {screen, render} from '@testing-library/react'
import React from 'react'

import OrderManagementFlowItem from '../OrderManagementFlowItem'

describe('<OrderManagementFlowItem />', () => {
    it('should render component', () => {
        render(
            <OrderManagementFlowItem
                isEnabled
                onChange={jest.fn()}
                title="title"
                description="description"
            />
        )

        expect(screen.getByText('title')).toBeInTheDocument()
    })
})
