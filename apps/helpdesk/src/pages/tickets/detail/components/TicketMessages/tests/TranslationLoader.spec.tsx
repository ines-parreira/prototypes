import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TranslationLoader } from '../TranslationLoader'

describe('TranslationLoader', () => {
    it('should render the translating text', () => {
        render(<TranslationLoader />)

        expect(screen.getByText('Translating...')).toBeInTheDocument()
    })

    it('should render without crashing', () => {
        expect(() => render(<TranslationLoader />)).not.toThrow()
    })
})
