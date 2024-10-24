import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import WizardFooter, {FOOTER_BUTTONS} from '../WizardFooter'

const mockOnClick = jest.fn()

const renderComponent = (
    props: Partial<React.ComponentProps<typeof WizardFooter>>
) => {
    return render(
        <WizardFooter
            displaySaveAndCustomizeLater={
                props.displaySaveAndCustomizeLater ?? true
            }
            displayCancelButton={props.displayCancelButton ?? true}
            displayNextButton={props.displayNextButton ?? true}
            displayBackButton={props.displayBackButton ?? true}
            displayFinishButton={props.displayFinishButton ?? true}
            displayCreateAndCustomizeButton={
                props.displayCreateAndCustomizeButton ?? true
            }
            onClick={mockOnClick}
        />
    )
}
describe('WizardFooter', () => {
    it('should render buttons and fire events on click', () => {
        renderComponent({})
        const saveAndCustomizeLaterButton = screen.getByText(
            'Save & Customize Later'
        )
        const createAndCustomizeButton = screen.getByText('Create & Customize')
        const cancelButton = screen.getByText('Cancel')
        const nextButton = screen.getByText('Next')
        const backButton = screen.getByText('Back')
        const finishButton = screen.getByText('Finish')

        userEvent.click(saveAndCustomizeLaterButton)
        expect(mockOnClick).toHaveBeenCalledWith(
            FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER
        )

        userEvent.click(createAndCustomizeButton)
        expect(mockOnClick).toHaveBeenCalledWith(
            FOOTER_BUTTONS.CREATE_AND_CUSTOMIZE
        )

        userEvent.click(cancelButton)
        expect(mockOnClick).toHaveBeenCalledWith(FOOTER_BUTTONS.CANCEL)

        userEvent.click(nextButton)
        expect(mockOnClick).toHaveBeenCalledWith(FOOTER_BUTTONS.NEXT)

        userEvent.click(backButton)
        expect(mockOnClick).toHaveBeenCalledWith(FOOTER_BUTTONS.BACK)

        userEvent.click(finishButton)
        expect(mockOnClick).toHaveBeenCalledWith(FOOTER_BUTTONS.FINISH)

        expect(mockOnClick).toHaveBeenCalledTimes(6)
    })

    it('should not render buttons ', () => {
        renderComponent({
            displaySaveAndCustomizeLater: false,
            displayCreateAndCustomizeButton: false,
            displayCancelButton: false,
            displayNextButton: false,
            displayBackButton: false,
            displayFinishButton: false,
        })
        const saveAndCustomizeLaterButton = screen.queryByText(
            'Save & Customize Later'
        )
        const createAndCustomizeButton =
            screen.queryByText('Create & Customize')
        const cancelButton = screen.queryByText('Cancel')
        const nextButton = screen.queryByText('Next')
        const backButton = screen.queryByText('Back')
        const finishButton = screen.queryByText('Finish')

        expect(saveAndCustomizeLaterButton).not.toBeInTheDocument()
        expect(createAndCustomizeButton).not.toBeInTheDocument()
        expect(cancelButton).not.toBeInTheDocument()
        expect(nextButton).not.toBeInTheDocument()
        expect(backButton).not.toBeInTheDocument()
        expect(finishButton).not.toBeInTheDocument()
    })
})
