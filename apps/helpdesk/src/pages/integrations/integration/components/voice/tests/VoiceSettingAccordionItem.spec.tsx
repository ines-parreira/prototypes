import React from 'react'

import { render, screen } from '@testing-library/react'

import VoiceSettingAccordionItem from '../VoiceSettingAccordionItem'

describe('<VoiceSettingAccordionItem />', () => {
    const defaultProps = {
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        children: <div>Test Children</div>,
    }

    const renderComponent = (props = {}) => {
        return render(
            <VoiceSettingAccordionItem {...defaultProps} {...props} />,
        )
    }

    it('should display the subtitle, description and children', () => {
        renderComponent()

        expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Test Children')).toBeInTheDocument()
    })
})
