import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom/extend-expect'
import {ConvAiOnboardingLayout} from '../ConvAiOnboardingLayout'

describe('ConvAiOnboardingLayout', () => {
    const preview = <div>Preview Content</div>
    const content = <div>Content</div>
    const previewLogo = 'logo'

    test('renders the layout with header, body, and preview', () => {
        render(
            <ConvAiOnboardingLayout
                preview={preview}
                content={content}
                previewLogo={previewLogo}
                onClose={() => {}}
                isLoading={false}
            />
        )

        expect(screen.getByAltText('Gorgias')).toBeInTheDocument()
        expect(screen.getByText('Preview Content')).toBeInTheDocument()
        expect(screen.getByText('Content')).toBeInTheDocument()
    })

    test('renders the loading pulser icon when isLoading is true', () => {
        render(
            <ConvAiOnboardingLayout
                preview={preview}
                content={content}
                previewLogo={previewLogo}
                onClose={() => {}}
                isLoading={true}
            />
        )

        expect(screen.getByText('logo')).toBeInTheDocument()
    })

    test('calls onClose when the close button is clicked', () => {
        const onClose = jest.fn()
        render(
            <ConvAiOnboardingLayout
                preview={preview}
                content={content}
                previewLogo={previewLogo}
                onClose={onClose}
            />
        )

        fireEvent.click(screen.getByText('close'))
        expect(onClose).toHaveBeenCalled()
    })
})
