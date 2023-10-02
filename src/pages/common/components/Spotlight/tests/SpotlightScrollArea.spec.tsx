import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Customer} from 'models/customer/types'
import mockedVirtuoso from 'tests/mockedVirtuoso'

import SpotlightScrollArea, {MAX_HEIGHT} from '../SpotlightScrollArea'

jest.mock('react-virtuoso', () => mockedVirtuoso)

jest.mock('pages/common/components/SkeletonLoader', () => () => (
    <div>SkeletonLoader</div>
))

describe('<SpotlightScrollArea/>', () => {
    const minProps: ComponentProps<typeof SpotlightScrollArea> = {
        data: [{id: 1}, {id: 2}, {id: 3}] as Customer[],
        canLoadMore: false,
        loadMore: jest.fn(),
        isLoading: false,
        scrollerRef: {current: null},
        itemContent: (index, data) => <div>{`${index} - item ${data.id}`}</div>,
    }

    it('should render', () => {
        const {container} = render(<SpotlightScrollArea {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render footer if loading', () => {
        const {container} = render(
            <SpotlightScrollArea {...minProps} isLoading={true} />
        )
        expect(container).toMatchSnapshot()
    })

    it('should not render a greater height than the maximum allowed', () => {
        const {container} = render(
            <SpotlightScrollArea
                {...minProps}
                data={
                    [
                        {id: 1},
                        {id: 2},
                        {id: 3},
                        {id: 4},
                        {id: 5},
                        {id: 6},
                        {id: 7},
                    ] as Customer[]
                }
            />
        )
        expect(container.firstChild).toHaveStyle(`height: ${MAX_HEIGHT}px`)
    })

    it('should call loadMore when end area is reached', () => {
        const {getByText} = render(
            <SpotlightScrollArea {...minProps} canLoadMore={true} />
        )

        const endTrigger = getByText('end area')
        userEvent.click(endTrigger)

        expect(minProps.loadMore).toHaveBeenCalled()
    })
})
