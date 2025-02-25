import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { channels as mockChannels } from 'fixtures/channels'

import DatetimeLabel from '../DatetimeLabel'

const mockStore = configureMockStore()

jest.mock('@gorgias/merchant-ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/merchant-ui-kit'),
        Tooltip: () => 'TooltipMock',
    } as Record<string, unknown>
})
jest.mock('state/integrations/selectors', () => ({
    getIntegrationChannel: () => () => mockChannels[0],
}))

jest.mock('hooks/useId', () => jest.fn(() => 'mocked'))

describe('<DatetimeLabel/>', () => {
    describe('render()', () => {
        it('should render with zero width space', () => {
            const { getByText } = render(
                <Provider
                    store={mockStore({
                        currentUser: fromJS({ timezone: 'utc' }),
                    })}
                >
                    <DatetimeLabel dateTime="2016-01-15" breakDate />
                </Provider>,
            )

            expect(getByText('01/​15/​2016')).toBeInTheDocument()
        })
    })
})
