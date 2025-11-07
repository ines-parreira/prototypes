import { render, screen } from '@testing-library/react'

import { PlaygroundGenericErrorMessage } from './PlaygroundGenericErrorMessage'

describe('PlaygroundGenericErrorMessage ', () => {
    it('should render error message', () => {
        render(<PlaygroundGenericErrorMessage onClick={() => {}} />)
        expect(
            screen.getByText(
                'AI Agent encountered an error and didn’t send a response.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Try again.')).toBeInTheDocument()
    })
})
