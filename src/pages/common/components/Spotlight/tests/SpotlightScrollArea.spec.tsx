// sort-imports-ignore
import mockedVirtuoso from 'tests/mockedVirtuoso'

import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { userEvent } from 'utils/testing/userEvent'

import { Customer } from 'models/customer/types'
import { PickedCustomer } from 'models/search/types'

import SpotlightScrollArea, { MAX_HEIGHT } from '../SpotlightScrollArea'

jest.mock('react-virtuoso', () => mockedVirtuoso)

jest.mock('pages/common/components/SkeletonLoader', () => () => (
    <div>SkeletonLoader</div>
))

describe('<SpotlightScrollArea/>', () => {
    const minProps: ComponentProps<typeof SpotlightScrollArea> = {
        data: [{ id: 1 }, { id: 2 }, { id: 3 }] as PickedCustomer[],
        canLoadMore: false,
        loadMore: jest.fn(),
        isLoading: false,
        scrollerRef: { current: null },
        itemContent: (index, data) => (
            <div>{`${index} - item ${(data as PickedCustomer).id}`}</div>
        ),
        header: () => null,
    }

    it('should render', () => {
        const { container } = render(<SpotlightScrollArea {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render footer if loading', () => {
        const { container } = render(
            <SpotlightScrollArea {...minProps} isLoading={true} />,
        )
        expect(container).toMatchSnapshot()
    })

    it('should not render a greater height than the maximum allowed', () => {
        const { container } = render(
            <SpotlightScrollArea
                {...minProps}
                data={
                    [
                        { id: 1 },
                        { id: 2 },
                        { id: 3 },
                        { id: 4 },
                        { id: 5 },
                        { id: 6 },
                        { id: 7 },
                    ] as Customer[]
                }
            />,
        )
        expect(container.firstChild).toHaveStyle(`height: ${MAX_HEIGHT}px`)
    })

    it('should call loadMore when end area is reached', () => {
        const { getByText } = render(
            <SpotlightScrollArea {...minProps} canLoadMore={true} />,
        )

        const endTrigger = getByText('end area')
        userEvent.click(endTrigger)

        expect(minProps.loadMore).toHaveBeenCalled()
    })

    it('should not call loadMore when end area is reached because of the prop canLoadMore set to false', () => {
        const { getByText } = render(
            <SpotlightScrollArea {...minProps} canLoadMore={false} />,
        )

        const endTrigger = getByText('end area')
        userEvent.click(endTrigger)

        expect(minProps.loadMore).not.toHaveBeenCalled()
    })

    it('should call loadMore when end area is reached with no data', () => {
        const { getByText } = render(
            <SpotlightScrollArea
                {...{ ...minProps, data: [] }}
                canLoadMore={true}
            />,
        )

        const endTrigger = getByText('end area')
        userEvent.click(endTrigger)

        expect(minProps.loadMore).toHaveBeenCalled()
    })
})
