import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import { SkillReviewCardHeader } from './SkillReviewCardHeader'
import { SkillWizardSkillStatus } from './skillWizard.mock'

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

describe('SkillReviewCardHeader', () => {
    it('renders the title and both ButtonGroup options', () => {
        render(
            <ThemeProvider>
                <SkillReviewCardHeader
                    title="Returns and exchanges"
                    status={SkillWizardSkillStatus.Approved}
                    onStatusChange={() => {}}
                />
            </ThemeProvider>,
        )

        expect(screen.getByText('Returns and exchanges')).toBeInTheDocument()
        expect(screen.getByText('Keep as draft')).toBeInTheDocument()
        expect(screen.getByText('Looks good')).toBeInTheDocument()
    })

    it('calls onStatusChange with Draft when the merchant clicks Keep as draft', async () => {
        const user = userEvent.setup()
        const onStatusChange = jest.fn()
        render(
            <ThemeProvider>
                <SkillReviewCardHeader
                    title="Returns and exchanges"
                    status={SkillWizardSkillStatus.Approved}
                    onStatusChange={onStatusChange}
                />
            </ThemeProvider>,
        )

        await user.click(screen.getByText('Keep as draft'))

        expect(onStatusChange).toHaveBeenCalledWith(
            SkillWizardSkillStatus.Draft,
        )
    })
})
