import React from 'react'

import {render} from '@testing-library/react'

import Magento2ModeSelectionButton from '../Magento2ModeSelectionButton.tsx'

describe('<Magento2ModeSelectionButton/>', () => {
    describe('render()', () => {
        it('should render the magento2 mode selection button', () => {
            const {container} = render(
                <Magento2ModeSelectionButton
                    text="Some button text"
                    icon="icon-name"
                    selected={true}
                    onClick={() => {}}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
