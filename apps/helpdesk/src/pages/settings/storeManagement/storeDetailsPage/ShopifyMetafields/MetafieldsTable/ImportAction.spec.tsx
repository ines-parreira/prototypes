import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImportAction from './ImportAction'

describe('ImportAction', () => {
    beforeEach(() => {
        jest.spyOn(window, 'confirm').mockImplementation(() => true)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render Import button', () => {
        render(<ImportAction />)

        expect(
            screen.getByRole('button', { name: /import/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Import')).toBeInTheDocument()
    })

    it('should call confirm when button is clicked', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm')
        render(<ImportAction />)

        const button = screen.getByRole('button', { name: /import/i })

        await act(async () => {
            await userEvent.click(button)
        })

        expect(confirmSpy).toHaveBeenCalledWith('TODO')
    })
})
