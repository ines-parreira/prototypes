import React from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import { PreviewModal } from '../PreviewModal'

describe('<PreviewModal />', () => {
    it('should render the modal and handler should be called when clicked', () => {
        const onCloseMock = jest.fn()
        const onUpgradeClickMock = jest.fn()
        const onStayClickMock = jest.fn()

        const { getByText } = render(
            <PreviewModal
                isOpen
                currentPriceLabel="$932/month"
                earlyAccessPriceLabel="$800/month"
                earlyAccessPriceReductionLabel="Save $132/month for 12 months"
                isLoading={false}
                onClose={onCloseMock}
                onStayClick={onStayClickMock}
                onUpgradeClick={onUpgradeClickMock}
            />,
        )

        const upgradeButton = getByText(
            'Upgrade AI Agent With Early Access Plan',
            { exact: true },
        )
        expect(upgradeButton).toBeInTheDocument()
        userEvent.click(upgradeButton)

        const staybutton = getByText('Stay On Current Plan', { exact: true })
        expect(staybutton).toBeInTheDocument()
        userEvent.click(staybutton)
    })
    it('should render the modal in loading state without crashing', () => {
        render(
            <PreviewModal
                isOpen
                currentPriceLabel="$932/month"
                earlyAccessPriceLabel="$800/month"
                earlyAccessPriceReductionLabel="Save $132/month for 12 months"
                isLoading={true}
                onClose={() => {}}
                onStayClick={() => {}}
                onUpgradeClick={() => {}}
            />,
        )
    })
})
