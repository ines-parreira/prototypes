import {render} from '@testing-library/react'
import React from 'react'

import Editor from 'pages/common/editor/Editor'

import TicketFooter from '../TicketFooter'
import TypingActivity from '../TypingActivity'

jest.mock('pages/common/editor/Editor', () => jest.fn(() => <p>Editor</p>))
jest.mock('../TypingActivity', () => jest.fn(() => <p>TypingActivity</p>))

describe('<TicketFooter />', () => {
    it('should not render anything if no context is given', () => {
        const {container} = render(<TicketFooter />)

        expect(container).toBeEmptyDOMElement()
    })

    it('should pass the given context down to the correct components', () => {
        const isShopperTyping = false
        const shopperName = 'chiel'
        const submit = jest.fn()

        const {getByText} = render(
            <TicketFooter context={{isShopperTyping, shopperName, submit}} />
        )

        expect(getByText('TypingActivity')).toBeInTheDocument()
        expect(getByText('Editor')).toBeInTheDocument()
        expect(TypingActivity).toHaveBeenCalledWith(
            {isTyping: isShopperTyping, name: shopperName},
            expect.objectContaining({})
        )
        expect(Editor).toHaveBeenCalledWith(
            {submit},
            expect.objectContaining({})
        )
    })
})
