import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MacrosSettingsItemTag } from '../MacrosSettingsItemTag'

describe('<MacrosSettingsItemTag />', () => {
    const props = {
        id: 'pop',
    }

    it('should display fallback when there are no tags', () => {
        render(<MacrosSettingsItemTag {...props} />)

        expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should display fallback when tags are empty', () => {
        render(<MacrosSettingsItemTag {...props} tags={[]} />)

        expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should display tags', async () => {
        const user = userEvent.setup()
        const tags = ['refund', 'urgent', 'cats']
        render(<MacrosSettingsItemTag {...props} tags={tags} />)

        expect(screen.getByText('refund')).toBeInTheDocument()
        expect(screen.getByText('+2')).toBeInTheDocument()

        await user.hover(screen.getByText('+2'))

        expect(await screen.findByText(tags.join(', '))).toBeInTheDocument()
    })
})
