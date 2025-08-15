import { fireEvent, render, screen } from '@testing-library/react'

import AIAgentTrialSuccessModal from '../AIAgentTrialSuccessModal'

describe('<AIAgentTrialSuccessModal/>', () => {
    it('renders', () => {
        const { getByText } = render(
            <AIAgentTrialSuccessModal
                isOpen={true}
                onClose={jest.fn()}
                onClick={jest.fn()}
            />,
        )

        expect(
            getByText('Shopping Assistant is live on your site!'),
        ).toBeInTheDocument()
    })

    it('user can click on action button', () => {
        const onClickMock = jest.fn()
        const onCloseMock = jest.fn()
        render(
            <AIAgentTrialSuccessModal
                isOpen={true}
                onClose={onCloseMock}
                onClick={onClickMock}
            />,
        )

        fireEvent.click(screen.getByText('Complete set up'))
        expect(onClickMock).toHaveBeenCalled()
        expect(onCloseMock).not.toHaveBeenCalled()

        const closeButton = screen.getByText(/close/i).closest('button')
        expect(closeButton).toBeInTheDocument()
        fireEvent.click(closeButton as HTMLButtonElement)
        expect(onCloseMock).toHaveBeenCalled()
    })
})
