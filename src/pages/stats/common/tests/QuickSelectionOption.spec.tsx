import React from 'react'
import {render} from '@testing-library/react'

import QuickSelectionOption from '../QuickSelectionOption'

describe('QuickSelectionOption', () => {
    const commonProps = {
        onClick: jest.fn(),
        selectedItemsCount: 0,
        totalItemsCount: 10,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display label to select content', () => {
        const {container} = render(<QuickSelectionOption {...commonProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display label to deselect one item', () => {
        const {container} = render(
            <QuickSelectionOption {...commonProps} selectedItemsCount={1} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display label to deselect all content', () => {
        const {container} = render(
            <QuickSelectionOption {...commonProps} selectedItemsCount={10} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display label to select partial content', () => {
        const {getByText} = render(
            <QuickSelectionOption {...commonProps} isPartial />
        )
        expect(getByText(/Select displayed/i)).toBeTruthy()
    })
})
