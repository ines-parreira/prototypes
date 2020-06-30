import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import MockAdapter from 'axios-mock-adapter'

import axios from 'axios'

import {Stats} from '../Stats'
import {views as statsViewsConfig} from '../../../config/stats'
import {firstResponseTimeStat} from '../../../fixtures/stats'

describe('<Stats/>', () => {
    const channelsStatView = statsViewsConfig.getIn(['channels', 'link'])
    const defaultProps = {
        notify: jest.fn(),
        filters: fromJS({
            period: {
                start_datetime: '2019-03-09',
                end_datetime: '2019-03-10',
            },
        }),
    }

    let apiMock = null

    beforeEach(() => {
        apiMock = new MockAdapter(axios)
        jest.resetAllMocks()
    })

    afterAll(() => {
        apiMock.restore()
    })

    describe('componentDidMount()', () => {
        it('should fetch stats and populate the state', (done) => {
            apiMock.onAny().reply(200, firstResponseTimeStat)

            const componentWrapper = shallow(
                <Stats {...defaultProps} params={{view: channelsStatView}} />
            )
            const component = componentWrapper.instance()
            expect(component.state).toMatchSnapshot(
                'should contain loading stats'
            )
            setTimeout(() => {
                expect(component.state).toMatchSnapshot(
                    'should contain data of stats and be marked as not loading'
                )
                done()
            })
        })

        it('should create a notification (server error) when fetching stats fails', (done) => {
            apiMock.onAny().reply(400, {error: {msg: 'Invalid filters'}})

            const componentWrapper = shallow(
                <Stats {...defaultProps} params={{view: channelsStatView}} />
            )
            const component = componentWrapper.instance()
            setTimeout(() => {
                expect(component.state).toMatchSnapshot(
                    'stats should be marked as not loading'
                )
                expect(defaultProps.notify.mock.calls).toMatchSnapshot()
                done()
            })
        })

        it('should create a notification (unknown error) when fetching stats fails', (done) => {
            apiMock.onAny().reply(500)

            const componentWrapper = shallow(
                <Stats {...defaultProps} params={{view: channelsStatView}} />
            )
            const component = componentWrapper.instance()
            setTimeout(() => {
                expect(component.state).toMatchSnapshot(
                    'stats should be marked as not loading'
                )
                expect(defaultProps.notify.mock.calls).toMatchSnapshot()
                done()
            })
        })
    })

    describe('componentWillUnmount()', () => {
        it('should cancel all pending API requests', () => {
            apiMock = new MockAdapter(axios, {delayResponse: 2000})

            const componentWrapper = shallow(
                <Stats {...defaultProps} params={{view: channelsStatView}} />
            )
            const component = componentWrapper.instance()
            const cancelPendingRequestsSpy = jest.fn()
            component.gorgiasApi.cancelPendingRequests = cancelPendingRequestsSpy
            component.componentWillUnmount()
            expect(cancelPendingRequestsSpy).toHaveBeenCalledWith()
        })
    })

    describe('render()', () => {
        it('should render stats', () => {
            const componentWrapper = shallow(
                <Stats {...defaultProps} params={{view: channelsStatView}} />
            )
            const component = componentWrapper.instance()
            component.setState({
                fetchingStates: fromJS({}),
                stats: fromJS({
                    'first-response-time': firstResponseTimeStat,
                }),
            })
            expect(componentWrapper.dive()).toMatchSnapshot()
        })

        it('should render stats as loading', () => {
            const componentWrapper = shallow(
                <Stats {...defaultProps} params={{view: channelsStatView}} />
            )
            const statNames = statsViewsConfig.getIn(['channels', 'stats'])
            const component = componentWrapper.instance()
            component.setState({
                fetchingStates: statNames.reduce(
                    (loaders, statName) => loaders.set(statName, true),
                    fromJS({})
                ),
                stats: fromJS({}),
            })
            expect(componentWrapper.dive()).toMatchSnapshot()
        })

        it("should not render stats because there is no stat to render and it's not fetching stats", () => {
            const componentWrapper = shallow(
                <Stats {...defaultProps} params={{view: channelsStatView}} />
            )
            const component = componentWrapper.instance()
            component.setState({
                fetchingStates: fromJS({}),
                stats: fromJS({}),
            })
            expect(componentWrapper.dive()).toMatchSnapshot()
        })
    })
})
