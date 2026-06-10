import React from 'react'

import { render } from '@repo/testing'

import SaveBadge from '../SaveBadge'

describe('SaveBadge', () => {
    it('should return null if the state is idle', () => {
        const { container } = render(<SaveBadge state="idle" />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should show a saving label if the state is saving', () => {
        const { getByText } = render(<SaveBadge state="saving" />)
        expect(getByText('Saving')).toBeInTheDocument()
    })

    it('should show a checkmark and a saved label if the state is saved', () => {
        const { getByText } = render(<SaveBadge state="saved" />)
        expect(getByText('check')).toBeInTheDocument()
        expect(getByText('Saved')).toBeInTheDocument()
    })
})
