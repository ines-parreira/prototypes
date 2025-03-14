import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
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
                isUpgrading={false}
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
                isUpgrading={false}
            />,
        )
    })

    it('should open the tips list when clicking on tips title', () => {
        render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onStayClick={() => {}}
                onUpgradeClick={() => {}}
                disableUpgradeButton={false}
                isUpgrading={false}
            />,
        )

        expect(
            screen.queryByText(
                'Meet the first AI Agent that sells via playbook',
            ),
        ).not.toBeInTheDocument()

        const tipsTitle = screen.getByText(
            'Grow GMV with Sales Skills for your AI Agent',
        )
        fireEvent.click(tipsTitle)

        expect(
            screen.queryByText(
                'Meet the first AI Agent that sells via playbook',
            ),
        ).toBeInTheDocument()
    })
})
