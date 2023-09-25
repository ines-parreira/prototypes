import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'

import {DistributionCategoryCell} from '../DistributionCategoryCell'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('react', () => {
    return {
        ...jest.requireActual<typeof React>('react'),
        useRef: jest.fn().mockReturnValue({current: null}),
    }
})

describe('<DistributionCategoryCell />', () => {
    const minProps: ComponentProps<typeof DistributionCategoryCell> = {
        category: 'Category',
        progress: 50,
    }

    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should render the cell', () => {
        render(
            <DistributionCategoryCell
                {...minProps}
                category={'Level 0::Level 1'}
            />
        )

        expect(screen.getByText('Level 0 > Level 1')).toBeInTheDocument()
    })

    it('should render truncated text from the right', () => {
        jest.spyOn(React, 'useRef').mockReturnValue({
            get current() {
                return {offsetWidth: 1, scrollWidth: 2}
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            set current(_value) {},
        })

        render(
            <DistributionCategoryCell
                {...minProps}
                category={'Level 0::Level 1'}
            />
        )

        expect(document.querySelector('.text')).toHaveClass('truncate')
    })
})
