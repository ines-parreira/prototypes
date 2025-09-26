import React from 'react'

import { render, screen } from '@testing-library/react'

import { PlaygroundPreviewHeader } from './PlaygroundPreviewHeader'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetCurrentUser: jest.fn(() => ({
        data: { data: { name: 'Aílton Krenak' } },
    })),
}))

describe('<PlaygroundPreviewHeader />', () => {
    it('should correctly apply current user name when available', () => {
        render(<PlaygroundPreviewHeader />)

        expect(screen.getByText('Aílton Krenak')).toBeInTheDocument()
        expect(screen.getByText('AK')).toBeInTheDocument()
    })

    it('should fallback to John Doe when current user name is not available', () => {
        const mockUseGetCurrentUser = require('@gorgias/helpdesk-queries')
            .useGetCurrentUser as jest.Mock
        mockUseGetCurrentUser.mockImplementation(() => ({
            data: { data: { name: undefined } },
        }))

        render(<PlaygroundPreviewHeader />)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
})
