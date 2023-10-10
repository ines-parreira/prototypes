import {render} from '@testing-library/react'
import React from 'react'
import CanduActionInfobar from 'pages/settings/new_billing/components/CanduActionInfobar/CanduActionInfobar'

describe('CanduActionInfobar', () => {
    it('should render button and text', () => {
        const text = 'Book a demo with us testers'
        const btnLabel = 'Book a test demo'
        const canduId = 'test-candu-id'
        const onClick = jest.fn()

        const {getByText} = render(
            <CanduActionInfobar
                text={text}
                btnLabel={btnLabel}
                canduId={canduId}
                onClick={onClick}
            />
        )

        expect(getByText(text)).toBeInTheDocument()

        const button = getByText(btnLabel, {selector: 'button'})
        expect(button).toBeInTheDocument()

        button.click()
        expect(onClick).toHaveBeenCalled()

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`
        )
        expect(canduDataId).not.toBeNull()
    })
})
