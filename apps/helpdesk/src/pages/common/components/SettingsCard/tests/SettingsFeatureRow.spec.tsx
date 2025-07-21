import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { SettingsFeatureRow } from '../SettingsFeatureRow'

describe('SettingsFeatureRow', () => {
    const defaultProps = {
        title: 'Test Feature',
        description: 'Test Description',
        nbFeatures: 3,
        badgeText: '3 items',
        onClick: jest.fn(),
    }

    it('renders correctly with all props', () => {
        render(<SettingsFeatureRow {...defaultProps} />)

        expect(screen.getByText('Test Feature')).toBeInTheDocument()
        expect(screen.getByText('3 items')).toBeInTheDocument()
    })

    it('calls onClick when clicked', () => {
        const onClickMock = jest.fn()
        render(<SettingsFeatureRow {...defaultProps} onClick={onClickMock} />)

        fireEvent.click(screen.getByText('Test Feature'))
        expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('displays correct badge text when no features', () => {
        render(
            <SettingsFeatureRow
                title="Test Feature"
                description="Test Description"
                onClick={jest.fn()}
                badgeText="No items"
            />,
        )

        expect(screen.getByText('No items')).toBeInTheDocument()
    })

    it('has a tooltip with description', async () => {
        render(<SettingsFeatureRow {...defaultProps} />)

        const infoIcon = screen.getByText('info')
        expect(infoIcon).toBeInTheDocument()

        fireEvent.mouseOver(infoIcon)

        await waitFor(() => {
            expect(screen.getByText('Test Description')).toBeInTheDocument()
        })
    })
})
