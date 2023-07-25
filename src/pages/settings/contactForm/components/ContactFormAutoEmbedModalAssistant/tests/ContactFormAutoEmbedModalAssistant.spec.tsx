import React from 'react'
import {render, screen} from '@testing-library/react'
import ContactFormAutoEmbedModalAssistant from '../ContactFormAutoEmbedModalAssistant'
import {MODAL_LABELS} from '../constants'

describe('<ContactFormAutoEmbedModalAssistant />', () => {
    it('it renders the component', () => {
        const isOpen = true
        const onClose = jest.fn()

        render(
            <ContactFormAutoEmbedModalAssistant
                isOpen={isOpen}
                onClose={onClose}
            />
        )

        screen.getByText(MODAL_LABELS.TITLE)
        screen.getByText(MODAL_LABELS.EMBED)
        screen.getByText(MODAL_LABELS.CANCEL)

        // a PageEmbedmentForm label
        screen.getByText(MODAL_LABELS.FORM_MODE_SELECTION_TITLE)
    })

    it.todo('should try embedding the form when clicking on the embed button')
})
