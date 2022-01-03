import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState} from '../../../state/types'
import IntegrationsStatsFilter, {
    FONT_ICONS,
    IMAGE_ICONS,
} from '../IntegrationsStatsFilter'
import {integrationsState} from '../../../fixtures/integrations'
import {IntegrationType} from '../../../models/integration/constants'
import {Integration} from '../../../models/integration/types'

const mockStore = configureMockStore([thunk])

describe('IntegrationsStatsFilter', () => {
    const defaultState = {
        stats: fromJS({
            filters: null,
        }),
    } as RootState

    it('should not render missing integrations', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <IntegrationsStatsFilter
                    value={[
                        integrationsState.integrations[0].id,
                        999999,
                        integrationsState.integrations[1].id,
                    ]}
                    integrations={
                        integrationsState.integrations as Integration[]
                    }
                    isMultiple
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        ...Object.keys(IMAGE_ICONS),
        ...Object.keys(FONT_ICONS),
    ] as IntegrationType[])(
        'should render icon for %s integration',
        (integrationType) => {
            const integration = {
                ...integrationsState.integrations[0],
                name: `${integrationType} integration`,
                type: integrationType,
            } as Integration

            const {getAllByRole} = render(
                <Provider store={mockStore(defaultState)}>
                    <IntegrationsStatsFilter
                        value={[]}
                        integrations={[integration]}
                    />
                </Provider>
            )

            const item = getAllByRole('menuitem', {
                hidden: true,
            })[1]
            expect(item).toMatchSnapshot()
        }
    )

    it('should merge stats filters on item select', () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <IntegrationsStatsFilter
                    value={[]}
                    integrations={
                        integrationsState.integrations as Integration[]
                    }
                />
            </Provider>
        )

        fireEvent.click(getByLabelText(integrationsState.integrations[1].name))

        expect(store.getActions()).toMatchSnapshot()
    })

    it('should replace the item when isMultiple is set to false', () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <IntegrationsStatsFilter
                    value={[integrationsState.integrations[0].id]}
                    isMultiple={false}
                    integrations={
                        integrationsState.integrations as Integration[]
                    }
                />
            </Provider>
        )

        fireEvent.click(getByLabelText(integrationsState.integrations[1].name))

        expect(store.getActions()).toMatchSnapshot()
    })

    it('should allow to select multiple items when isMultiple is set to true', () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <IntegrationsStatsFilter
                    value={[integrationsState.integrations[0].id]}
                    integrations={
                        integrationsState.integrations as Integration[]
                    }
                    isMultiple
                />
            </Provider>
        )

        fireEvent.click(getByLabelText(integrationsState.integrations[1].name))

        expect(store.getActions()).toMatchSnapshot()
    })
})
