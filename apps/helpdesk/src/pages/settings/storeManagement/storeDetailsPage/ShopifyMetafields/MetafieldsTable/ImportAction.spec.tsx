import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImportAction from './ImportAction'

describe('ImportAction', () => {
    it('should render Import button', () => {
        const onImportClick = jest.fn()
        render(<ImportAction onImportClick={onImportClick} />)

        expect(
            screen.getByRole('button', { name: /import/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Import')).toBeInTheDocument()
    })

    it('should call onImportClick when button is clicked', async () => {
        const onImportClick = jest.fn()
        render(<ImportAction onImportClick={onImportClick} />)

        const button = screen.getByRole('button', { name: /import/i })

        await act(async () => {
            await userEvent.click(button)
        })

        expect(onImportClick).toHaveBeenCalledTimes(1)
    })
})
