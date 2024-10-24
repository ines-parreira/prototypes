import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import {LightCampaignModalType} from 'pages/convert/campaigns/types/enums/LightCampaignModalType'
import {CONVERT_PRODUCT_LINK} from 'pages/convert/common/constants'

import LightCampaignModal from '../LightCampaignModal'

describe('<LightCampaignModal />', () => {
    const setIsDismissed = jest.fn()
    const onSubmit = jest.fn()
    const onClose = jest.fn()
    const props = {
        modalType: LightCampaignModalType.DeactivateCampaign,
        isOpen: true,
        isDismissed: false,
        setIsDismissed: setIsDismissed,
        isSubmitting: false,
        onSubmit: onSubmit,
        onClose: onClose,
    }

    it('renders the modal', async () => {
        const {getByText, getAllByText} = render(
            <LightCampaignModal {...props} />
        )

        getByText('Learn About Convert')

        await waitFor(() => {
            expect(getAllByText('Deactivate campaign').length).toBe(2)
        })
    })

    it('calls `onSubmit` when the submit button is clicked', () => {
        const {getByRole} = render(<LightCampaignModal {...props} />)

        const deactivateButton = getByRole('button', {
            name: 'Deactivate campaign',
        })
        fireEvent.click(deactivateButton)

        expect(onSubmit).toHaveBeenCalled()
    })

    it('calls `onClose` when the close button is clicked', () => {
        const {getByText} = render(<LightCampaignModal {...props} />)

        fireEvent.click(getByText('Cancel'))

        expect(onClose).toHaveBeenCalled()
    })

    it('calls `onClose` when the modal is dismissed', () => {
        const {getByText, getByRole} = render(<LightCampaignModal {...props} />)

        const deactivateButton = getByRole('button', {
            name: 'Deactivate campaign',
        })

        // select the checkbox and then confirm by some action
        fireEvent.click(getByText("Don't show this message again"))
        fireEvent.click(deactivateButton)

        expect(setIsDismissed).toHaveBeenCalled()
    })

    it('calls `onLearnClick` when the learn more button is clicked', () => {
        const {getByText} = render(<LightCampaignModal {...props} />)

        fireEvent.click(getByText('Learn About Convert'))

        expect(window.open).toHaveBeenCalledWith(
            CONVERT_PRODUCT_LINK,
            '_blank',
            'noopener'
        )
    })
})
