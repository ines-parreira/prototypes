import { fireEvent, render, screen } from '@testing-library/react'

import { CopyIconButton } from './KnowledgeEditorTopBarCommonControls'

describe('KnowledgeEditorTopBarCommonControls', () => {
    it('renders copy button', () => {
        const onCopy = jest.fn()

        render(<CopyIconButton onCopy={onCopy} />)

        fireEvent.click(screen.getByRole('button', { name: 'copy' }))

        expect(onCopy).toHaveBeenCalled()
    })
})
