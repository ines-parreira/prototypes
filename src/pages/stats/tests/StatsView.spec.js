import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import StatsView from '../StatsView'

const mockStore = configureMockStore([thunk])

describe('StatsView', () => {
    let store = null
    beforeEach(() => {
        store = mockStore({
            currentAccount: fromJS({
                extra_features: ['satisfaction-surveys', 'revenue'],
                settings: [{
                    data: {},
                    type: 'satisfaction-surveys'
                }]
            })
        })
        jest.clearAllMocks()
    })

    describe('render satisfaction surveys', () => {
        it('should render current survey stats', () => {
            const component = mount(
                <StatsView
                    store={store}
                    config={fromJS({
                        name: 'Satisfaction',
                        link: 'satisfaction',
                        stats: [],
                    })}
                    agents={fromJS([])}
                    channels={fromJS([])}
                    tags={fromJS([])}
                    stats={fromJS([])}
                    meta={fromJS([])}
                    filters={fromJS([])}
                    fetchStat={jest.fn()}
                    setMeta={jest.fn()}
                    setFilters={jest.fn()}
                    fieldEnumSearch={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the upgrade to pro component', () => {
            store = mockStore({
                currentAccount: fromJS({
                    extra_features: [],
                    settings: [{
                        data: {},
                        type: 'satisfaction-surveys'
                    }]
                })
            })

            const component = mount(
                <StatsView
                    store={store}
                    config={fromJS({
                        name: 'Satisfaction',
                        link: 'satisfaction',
                        stats: [],
                    })}
                    agents={fromJS([])}
                    channels={fromJS([])}
                    tags={fromJS([])}
                    stats={fromJS([])}
                    meta={fromJS([])}
                    filters={fromJS([])}
                    fetchStat={jest.fn()}
                    setMeta={jest.fn()}
                    setFilters={jest.fn()}
                    fieldEnumSearch={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('render revenue stats', () => {
        it('should render current revenue stats', () => {
            const component = mount(
                <StatsView
                    store={store}
                    config={fromJS({
                        name: 'Revenue (Beta)',
                        link: 'revenue',
                        stats: [],
                    })}
                    agents={fromJS([])}
                    channels={fromJS([])}
                    tags={fromJS([])}
                    stats={fromJS([])}
                    meta={fromJS([])}
                    filters={fromJS([])}
                    fetchStat={jest.fn()}
                    setMeta={jest.fn()}
                    setFilters={jest.fn()}
                    fieldEnumSearch={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the upgrade to pro component', () => {
            store = mockStore({
                currentAccount: fromJS({
                    extra_features: [],
                })
            })

            const component = mount(
                <StatsView
                    store={store}
                    config={fromJS({
                        name: 'Revenue (Beta)',
                        link: 'revenue',
                        stats: [],
                    })}
                    agents={fromJS([])}
                    channels={fromJS([])}
                    tags={fromJS([])}
                    stats={fromJS([])}
                    meta={fromJS([])}
                    filters={fromJS([])}
                    fetchStat={jest.fn()}
                    setMeta={jest.fn()}
                    setFilters={jest.fn()}
                    fieldEnumSearch={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
