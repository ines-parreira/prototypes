import type { ComponentProps } from 'react'

import { ticketViewNavigationOrderingStore } from '@repo/navigation'
import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { Navigation } from 'components/Navigation/Navigation'
import { section } from 'fixtures/section'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import { ViewVisibility } from 'models/view/types'
import { SplitTicketViewProvider } from 'split-ticket-view-toggle'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import type { TicketNavbarElement } from '../TicketNavbarContent'
import { TicketNavbarContentBridgeContainer } from '../TicketNavbarContentBridge'
import { TicketNavbarDropDirection } from '../TicketNavbarDropTarget'

let mockContentDropTargetProps: {
    canDrop?: (item: unknown) => boolean
    onDrop?: (item: unknown, monitor: unknown, direction: unknown) => void
} = {}
let mockViewDropTargetProps: {
    canDrop?: (item: unknown) => boolean
} = {}

jest.mock('../TicketNavbarDropTarget', () => {
    const actual = jest.requireActual('../TicketNavbarDropTarget')

    return {
        __esModule: true,
        ...actual,
        default: ({
            accept,
            children,
            canDrop,
            onDrop,
            topIndicatorClassName,
        }: any) => {
            if (Array.isArray(accept) && topIndicatorClassName) {
                mockContentDropTargetProps = { canDrop, onDrop }
            }
            if (Array.isArray(accept) && !topIndicatorClassName) {
                mockViewDropTargetProps = { canDrop }
            }

            return <div>{children}</div>
        },
    }
})

describe('<TicketNavbarContentBridge/>', () => {
    const minProps = {
        elements: [
            {
                children: [],
                data: { ...section, id: 7 },
                type: TicketNavbarElementType.Section,
            },
            {
                data: { ...view, id: 10, name: 'Test View 10' },
                type: TicketNavbarElementType.View,
            },
        ] as TicketNavbarElement[],
        currentUser: fromJS(user),
        isPrivate: true,
        notify: jest.fn(),
        onClickDeleteSection: null,
        onClickRenameSection: null,
        sections: {
            7: { ...section, id: 7 },
        },
        viewUpdated: jest.fn(),
        views: {
            [view.id]: { ...view, section_id: 4 },
            10: { ...view, id: 10, name: 'Test View 10', section_id: null },
        },
    } as unknown as ComponentProps<typeof TicketNavbarContentBridgeContainer>

    beforeEach(() => {
        localStorage.removeItem('collapsed-view-sections')
        mockContentDropTargetProps = {}
        mockViewDropTargetProps = {}
        ticketViewNavigationOrderingStore
            .getState()
            .resetOptimisticTicketViewNavigationOrdering()
    })

    afterAll(() => {
        global.localStorage.removeItem('collapsed-view-sections')
    })

    describe('rendering', () => {
        it('should render sections and views', () => {
            const { getByText } = render(
                <SplitTicketViewProvider>
                    <Navigation.Root>
                        <TicketNavbarContentBridgeContainer {...minProps} />
                    </Navigation.Root>
                </SplitTicketViewProvider>,
                {
                    storeState: {
                        currentUser: fromJS(user),
                        entities: fromJS({}),
                    },
                },
            )

            expect(
                getByText(minProps.elements[0].data.name),
            ).toBeInTheDocument()
            expect(
                getByText(minProps.elements[1].data.name),
            ).toBeInTheDocument()
        })

        it('uses provided view and section maps for drop handling', () => {
            const injectedView = {
                ...view,
                id: 77,
                name: 'Injected Private View',
                section_id: null,
                visibility: ViewVisibility.Private,
            }
            const injectedSection = {
                ...section,
                id: 88,
                name: 'Injected Private Section',
                private: true,
            }
            const onSubmitMoveItem = jest.fn()
            const viewUpdated = jest.fn()

            render(
                <SplitTicketViewProvider>
                    <Navigation.Root>
                        <TicketNavbarContentBridgeContainer
                            {...minProps}
                            elements={[
                                {
                                    data: injectedView,
                                    type: TicketNavbarElementType.View,
                                },
                                {
                                    children: [],
                                    data: injectedSection,
                                    type: TicketNavbarElementType.Section,
                                },
                            ]}
                            isPrivate={true}
                            onSubmitMoveItem={onSubmitMoveItem}
                            sections={{ [injectedSection.id]: injectedSection }}
                            viewUpdated={
                                viewUpdated as unknown as ComponentProps<
                                    typeof TicketNavbarContentBridgeContainer
                                >['viewUpdated']
                            }
                            views={{ [injectedView.id]: injectedView }}
                        />
                    </Navigation.Root>
                </SplitTicketViewProvider>,
                {
                    storeState: {
                        currentUser: fromJS(user),
                        entities: fromJS({}),
                    },
                },
            )

            expect(
                mockContentDropTargetProps.canDrop?.({
                    id: injectedView.id,
                    type: TicketNavbarElementType.View,
                }),
            ).toBe(true)
            expect(
                mockViewDropTargetProps.canDrop?.({
                    id: injectedSection.id,
                    type: TicketNavbarElementType.Section,
                }),
            ).toBe(true)

            mockContentDropTargetProps.onDrop?.(
                {
                    id: injectedView.id,
                    type: TicketNavbarElementType.View,
                },
                {
                    getDropResult: () => ({
                        direction: TicketNavbarDropDirection.Down,
                        sectionId: injectedSection.id,
                        viewId: null,
                    }),
                },
                TicketNavbarDropDirection.Down,
            )

            expect(viewUpdated).toHaveBeenCalledWith({
                ...injectedView,
                section_id: injectedSection.id,
            })
            expect(onSubmitMoveItem).toHaveBeenCalledWith(
                {
                    data: {
                        ...injectedView,
                        section_id: injectedSection.id,
                    },
                    type: TicketNavbarElementType.View,
                },
                {
                    data: injectedView,
                    type: TicketNavbarElementType.View,
                },
                expect.any(Object),
                true,
            )
            expect(
                ticketViewNavigationOrderingStore.getState()
                    .optimisticPrivateOrdering.view_sections[injectedSection.id]
                    .display_order,
            ).toBe(0)
        })
    })
})
