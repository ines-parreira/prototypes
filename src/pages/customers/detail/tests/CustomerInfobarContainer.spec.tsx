import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import {CustomerInfobarContainer} from '../CustomerInfobarContainer'
import {Infobar} from '../../../common/components/infobar/Infobar/Infobar'

jest.mock(
    '../../../common/components/infobar/Infobar/Infobar',
    () =>
        ({
            actions,
            sources,
            isRouteEditingWidgets,
            identifier,
            customer,
            widgets,
            context,
        }: ComponentProps<typeof Infobar>) =>
            (
                <div>
                    <div>Infobar</div>
                    <div>actions: {JSON.stringify(actions)}</div>
                    <div>sources: {JSON.stringify(sources)}</div>
                    <div>isRouteEditingWidgets: {isRouteEditingWidgets}</div>
                    <div>identifier: {identifier}</div>
                    <div>customer: {customer}</div>
                    <div>widgets: {JSON.stringify(widgets)}</div>
                    <div>context: {context}</div>
                </div>
            )
)

describe('<CustomerInfobarContainer />', () => {
    const minProps = {
        actions: {
            fetchPreviewCustomer: jest.fn(),
            widgets: {
                cancelDrag: jest.fn(),
                drag: jest.fn(),
                drop: jest.fn(),
                fetchWidgets: jest.fn(),
                generateAndSetWidgets: jest.fn(),
                removeEditedWidget: jest.fn(),
                resetWidgets: jest.fn(),
                selectContext: jest.fn(),
                setEditedWidgets: jest.fn(),
                setEditionAsDirty: jest.fn(),
                startEditionMode: jest.fn(),
                startWidgetEdition: jest.fn(),
                stopEditionMode: jest.fn(),
                stopWidgetEdition: jest.fn(),
                submitWidgets: jest.fn(),
                updateEditedWidget: jest.fn(),
            },
        },
        activeCustomer: fromJS({name: 'Don Draper'}),
        activeCustomerId: 1,
        isEditingWidgets: false,
        sources: fromJS({
            ticket: fromJS({
                customer: fromJS({}),
            }),
            customer: fromJS({}),
        }),
        widgets: fromJS({}),
    } as unknown as ComponentProps<typeof CustomerInfobarContainer>

    it('should render infobar for active customer', () => {
        const {container} = render(<CustomerInfobarContainer {...minProps} />)

        expect(minProps.actions.widgets.selectContext).toHaveBeenCalledWith(
            'customer'
        )
        expect(minProps.actions.widgets.fetchWidgets).toHaveBeenCalled()
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render anything without a customer id', () => {
        const {container} = render(
            <CustomerInfobarContainer {...minProps} activeCustomerId={null} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
