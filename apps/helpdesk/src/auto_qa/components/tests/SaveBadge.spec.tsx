import React from 'react'

import { render } from '@testing-library/react'

import SaveBadge from '../SaveBadge'

jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
        LoadingSpinner: () => <div>Spinner</div>,
    } as Record<string, unknown>
})

describe('SaveBadge', () => {
    it('should return null if the state is idle', () => {
        const { container } = render(<SaveBadge state="idle" />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should show a spinner and a saving label if the state is saving', () => {
        const { getByText } = render(<SaveBadge state="saving" />)
        expect(getByText('Spinner')).toBeInTheDocument()
        expect(getByText('Saving')).toBeInTheDocument()
    })

    it('should show a checkmark and a saved label if the state is saved', () => {
        const { getByText } = render(<SaveBadge state="saved" />)
        expect(getByText('check')).toBeInTheDocument()
        expect(getByText('Saved')).toBeInTheDocument()
    })
})
