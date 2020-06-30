import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import InfobarWidgetsEditionTools from '../InfobarWidgetsEditionTools'

const commonProps = {
    widgets: fromJS({
        _internal: {
            isDirty: false,
            loading: {
                saving: false,
            },
        },
    }),
    actions: {
        submitWidgets: jest.fn(),
        startEditionMode: jest.fn(),
    },
    context: 'ticket',
}

describe('InfobarWidgetsEditionTools component', () => {
    it('should render widgets edition tools disabled because the widgets are not dirty', () => {
        const component = shallow(
            <InfobarWidgetsEditionTools {...commonProps} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render widgets edition tools loading and disabled, because the widgets are being saved', () => {
        const component = shallow(
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
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render widgets edition tools enabled because the widgets are dirty and not being saved', () => {
        const component = shallow(
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
            />
        )

        expect(component).toMatchSnapshot()
    })
})
