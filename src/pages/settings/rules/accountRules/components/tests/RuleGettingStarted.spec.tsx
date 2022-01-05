import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import UpsellComponent from '../RuleGettingStarted'

describe('<RuleGettingStarted />', () => {
    const minProps: ComponentProps<typeof UpsellComponent> = {
        goToLibrary: jest.fn(),
    }

    it('should render with logo', () => {
        const {container} = render(<UpsellComponent {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should go to rule library on click', async () => {
        const {getByText} = render(<UpsellComponent {...minProps} />)
        fireEvent.click(getByText(/visit rule library/i))
        await waitFor(() => {
            expect(minProps.goToLibrary).toHaveBeenCalled()
        })
    })
})
