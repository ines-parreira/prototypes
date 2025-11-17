import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { StoreDispatch } from 'state/types'
import { WidgetEnvironment } from 'state/widgets/types'

import { InfobarWidgetsEditionTools } from '../InfobarWidgetsEditionTools'

const commonProps: ComponentProps<typeof InfobarWidgetsEditionTools> = {
    widgets: fromJS({
        _internal: {
            isDirty: false,
            loading: {
                saving: false,
            },
        },
    }),
    dispatch: jest.fn() as StoreDispatch,
    context: WidgetEnvironment.Ticket,
}

describe('InfobarWidgetsEditionTools component', () => {
    it('should render widgets edition tools disabled because the widgets are not dirty', () => {
        const { container } = render(
            <InfobarWidgetsEditionTools {...commonProps} />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render widgets edition tools loading and disabled, because the widgets are being saved', () => {
        const { container } = render(
            <InfobarWidgetsEditionTools
                {...commonProps}
                widgets={fromJS({
                    _internal: {
                        isDirty: true,
                        loading: {
                            saving: true,
                        },
                    },
                })}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render widgets edition tools enabled because the widgets are dirty and not being saved', () => {
        const { container } = render(
            <InfobarWidgetsEditionTools
                {...commonProps}
                widgets={fromJS({
                    _internal: {
                        isDirty: true,
                        loading: {
                            saving: false,
                        },
                    },
                })}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
