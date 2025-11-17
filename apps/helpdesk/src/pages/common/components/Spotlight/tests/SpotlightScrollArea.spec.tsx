import type { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { Customer } from 'models/customer/types'
import type { PickedCustomer } from 'models/search/types'
import mockedVirtuoso from 'tests/mockedVirtuoso'

import SpotlightScrollArea, {
    GroupedSpotlightScrollArea,
    MAX_HEIGHT,
} from '../SpotlightScrollArea'

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

    it('should call loadMore when end area is reached', async () => {
        const { getByText } = render(
            <SpotlightScrollArea {...minProps} canLoadMore={true} />,
        )

        const endTrigger = getByText('end area')
        await userEvent.click(endTrigger)

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

    it('should call loadMore when end area is reached with no data', async () => {
        const { getByText } = render(
            <SpotlightScrollArea
                {...{ ...minProps, data: [] }}
                canLoadMore={true}
            />,
        )

        const endTrigger = getByText('end area')
        await userEvent.click(endTrigger)

        expect(minProps.loadMore).toHaveBeenCalled()
    })

    it('should render header when provided', () => {
        const HeaderComponent = () => (
            <div data-testid="custom-header">Custom Header</div>
        )
        const { getByTestId } = render(
            <SpotlightScrollArea {...minProps} header={HeaderComponent} />,
        )

        expect(getByTestId('custom-header')).toBeInTheDocument()
    })

    it('should not render header when undefined', () => {
        const { container } = render(
            <SpotlightScrollArea {...minProps} header={undefined} />,
        )

        // Verify header component is not rendered
        expect(
            container.querySelector('[data-testid="custom-header"]'),
        ).not.toBeInTheDocument()
    })

    it('should not render header when not provided', () => {
        const propsWithoutHeader = { ...minProps }
        delete propsWithoutHeader.header

        const { container } = render(
            <SpotlightScrollArea {...propsWithoutHeader} />,
        )

        // Verify header component is not rendered
        expect(
            container.querySelector('[data-testid="custom-header"]'),
        ).not.toBeInTheDocument()
    })

    it('should adjust height calculation based on header presence', () => {
        const HeaderComponent = () => <div>Header</div>

        // Test with header
        const { container: containerWithHeader } = render(
            <SpotlightScrollArea {...minProps} header={HeaderComponent} />,
        )

        // Test without header
        const { container: containerWithoutHeader } = render(
            <SpotlightScrollArea {...minProps} header={undefined} />,
        )

        const withHeaderHeight = (containerWithHeader.firstChild as HTMLElement)
            ?.style?.height
        const withoutHeaderHeight = (
            containerWithoutHeader.firstChild as HTMLElement
        )?.style?.height

        expect(withHeaderHeight).toBeDefined()
        expect(withoutHeaderHeight).toBeDefined()
        expect(withHeaderHeight).not.toBe(withoutHeaderHeight)
    })
})

describe('<GroupedSpotlightScrollArea/>', () => {
    const minGroupedProps: ComponentProps<typeof GroupedSpotlightScrollArea> = {
        canLoadMore: false,
        isLoading: false,
        scrollerRef: { current: null },
        itemContent: (index, groupIndex, data) => (
            <div>{`${index} - group ${groupIndex} - item ${data ? (data as PickedCustomer).id : 'mock'}`}</div>
        ),
        groupCounts: [2, 1],
        groupContent: (index: number) => <div>Group {index}</div>,
    }

    it('should render GroupedSpotlightScrollArea without header when not provided', () => {
        const propsWithoutHeader = { ...minGroupedProps }
        delete propsWithoutHeader.header

        expect(() => {
            render(<GroupedSpotlightScrollArea {...propsWithoutHeader} />)
        }).not.toThrow()
    })

    it('should render GroupedSpotlightScrollArea without errors when header provided', () => {
        const HeaderComponent = () => <div>Grouped Header</div>

        expect(() => {
            render(
                <GroupedSpotlightScrollArea
                    {...minGroupedProps}
                    header={HeaderComponent}
                />,
            )
        }).not.toThrow()
    })

    it('should render GroupedSpotlightScrollArea without errors when header is undefined', () => {
        expect(() => {
            render(
                <GroupedSpotlightScrollArea
                    {...minGroupedProps}
                    header={undefined}
                />,
            )
        }).not.toThrow()
    })

    it('should adjust height calculation based on header presence in GroupedSpotlightScrollArea', () => {
        const HeaderComponent = () => <div>Grouped Header</div>

        // Test with header
        const { container: containerWithHeader } = render(
            <GroupedSpotlightScrollArea
                {...minGroupedProps}
                header={HeaderComponent}
            />,
        )

        // Test without header
        const { container: containerWithoutHeader } = render(
            <GroupedSpotlightScrollArea
                {...minGroupedProps}
                header={undefined}
            />,
        )

        const withHeaderHeight = (containerWithHeader.firstChild as HTMLElement)
            ?.style?.height
        const withoutHeaderHeight = (
            containerWithoutHeader.firstChild as HTMLElement
        )?.style?.height

        expect(withHeaderHeight).toBeDefined()
        expect(withoutHeaderHeight).toBeDefined()
        expect(withHeaderHeight).not.toBe(withoutHeaderHeight)
    })
})
