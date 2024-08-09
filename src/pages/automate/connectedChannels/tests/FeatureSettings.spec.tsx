import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import {FeatureSettings} from '../components/FeatureSettings'

describe('FeatureSettings', () => {
    test('renders the component with all props', () => {
        render(
            <FeatureSettings
                enabled={true}
                title="Feature Title"
                externalLinkUrl="http://example.com"
                subtitle="Feature Subtitle"
                label="Toggle Label"
                labelSubtitle="Label Subtitle"
            />
        )

        expect(screen.getByText('Feature Title')).toBeInTheDocument()
        expect(screen.getByText('Feature Subtitle')).toBeInTheDocument()
        expect(screen.getByText('Toggle Label')).toBeInTheDocument()
        expect(screen.getByText('Label Subtitle')).toBeInTheDocument()
        expect(screen.getByText(/open_in_new/i)).toBeInTheDocument()
    })

    test('renders the component without optional props', () => {
        render(
            <FeatureSettings
                enabled={false}
                title="Feature Title"
                label="Toggle Label"
            />
        )

        expect(screen.getByText('Feature Title')).toBeInTheDocument()
        expect(screen.queryByText('Feature Subtitle')).not.toBeInTheDocument()
        expect(screen.getByText('Toggle Label')).toBeInTheDocument()
        expect(screen.queryByText('Label Subtitle')).not.toBeInTheDocument()
        expect(screen.queryByText(/open_in_new/i)).not.toBeInTheDocument()
    })

    test('toggles the input when clicked', () => {
        const onChange = jest.fn()

        render(
            <FeatureSettings
                enabled={false}
                title="Feature Title"
                label="Toggle Label"
                subtitle="Feature Subtitle"
                onToggle={onChange}
            />
        )

        const toggleInput = screen.getByRole('checkbox')
        fireEvent.click(toggleInput)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    test('should not toggle the input when disabled', () => {
        const onChange = jest.fn()

        render(
            <FeatureSettings
                enabled={false}
                title="Feature Title"
                label="Toggle Label"
                subtitle="Feature Subtitle"
                disabled
                onToggle={onChange}
            />
        )

        const toggleInput = screen.getByRole('checkbox')
        fireEvent.click(toggleInput)
        expect(onChange).not.toHaveBeenCalled()
    })

    test('should render configuration required alert when showConfigurationRequiredAlert is true', () => {
        render(
            <FeatureSettings
                enabled={false}
                title="Feature Title"
                label="Toggle Label"
                showConfigurationRequiredAlert
                externalLinkUrl="http://example.com"
            />
        )

        expect(screen.getByText('Toggle Label')).toBeInTheDocument()
        expect(screen.getByText(/open_in_new/i)).toBeInTheDocument()
    })
})
