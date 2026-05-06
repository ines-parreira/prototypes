import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'

import { SkillReviewStep } from './SkillReviewStep'

describe('SkillReviewStep', () => {
    it('renders the recommendation prefixed with the 1-based step', () => {
        render(
            <ThemeProvider>
                <SkillReviewStep recommendation="Returns" index={4} />
            </ThemeProvider>,
        )

        expect(screen.getByText('Step 5: Returns')).toBeInTheDocument()
    })
})
