import React from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import { EarlyAccessModal } from '../EarlyAccessModal'

describe('<EarlyAccessModal />', () => {
    it('should render the modal and handler should be called when clicked', () => {
        const onCloseMock = jest.fn()
        const onUpgradeClickMock = jest.fn()
        const onStayClickMock = jest.fn()

        const { getByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={false}
                onClose={onCloseMock}
                onStayClick={onStayClickMock}
                onUpgradeClick={onUpgradeClickMock}
                disableUpgradeButton={false}
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
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onStayClick={() => {}}
                onUpgradeClick={() => {}}
                disableUpgradeButton={false}
            />,
        )
    })
})
