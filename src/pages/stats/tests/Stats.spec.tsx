import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import axios, {CancelTokenSource} from 'axios'

import {StatsContainer} from '../Stats'
import {views as statsViewsConfig} from '../../../config/stats'
import {firstResponseTimeStat} from '../../../fixtures/stats'
import client from '../../../models/api/resources'

const mockedCancelRequest = jest.fn()

jest.mock('lodash/debounce', () => (fn: () => void) => () => fn())

describe('<Stats/>', () => {
    const channelsStatView = statsViewsConfig.getIn(['channels', 'link'])
    const notifyMock = jest.fn()
    const statFetchedMock = jest.fn()
    const fetchStatEndedMock = jest.fn()
    const fetchStatStartedMock = jest.fn()
    const defaultProps = ({
        notify: notifyMock,
        filters: fromJS({
            period: {
                start_datetime: '2019-03-09',
                end_datetime: '2019-03-10',
            },
        }),
        statFetched: statFetchedMock,
        fetchStatEnded: fetchStatEndedMock,
        fetchStatStarted: fetchStatStartedMock,
    } as unknown) as ComponentProps<typeof StatsContainer>

    let apiMock: MockAdapter

    beforeEach(() => {
        apiMock = new MockAdapter(client)
        jest.resetAllMocks()
    })

    afterAll(() => {
        apiMock.restore()
    })

    describe('componentDidMount()', () => {
        it('should fetch stats', (done) => {
            apiMock.onAny().reply(200, firstResponseTimeStat)
            shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )

            expect(fetchStatStartedMock.mock.calls).toMatchSnapshot()
            setTimeout(() => {
                expect(fetchStatEndedMock.mock.calls).toMatchSnapshot()
                expect(statFetchedMock.mock.calls).toMatchSnapshot()
                done()
            })
        })

        it('should create a notification (server error) when fetching stats fails', (done) => {
            apiMock.onAny().reply(400, {error: {msg: 'Invalid filters'}})
            shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )

            setTimeout(() => {
                expect(fetchStatEndedMock.mock.calls).toMatchSnapshot()
                expect(notifyMock.mock.calls).toMatchSnapshot()
                done()
            })
        })

        it('should create a notification (unknown error) when fetching stats fails', (done) => {
            apiMock.onAny().reply(500)
            shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )

            setTimeout(() => {
                expect(fetchStatEndedMock.mock.calls).toMatchSnapshot()
                expect(notifyMock.mock.calls).toMatchSnapshot()
                done()
            })
        })
    })

    describe('componentDidUpdate', () => {
        it('should fetch stats when view parameter change', (done) => {
            apiMock.onAny().reply(200, firstResponseTimeStat)
            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            setTimeout(() => {
                componentWrapper.setProps({
                    match: {
                        params: {
                            view: statsViewsConfig.getIn([
                                'support-performance-agents',
                                'link',
                            ]),
                        },
                    },
                })
                setTimeout(() => {
                    expect(statFetchedMock.mock.calls).toMatchSnapshot()
                    done()
                })
            })
        })

        it('should fetch stats when filters change', (done) => {
            apiMock.onAny().reply(200, firstResponseTimeStat)
            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            setTimeout(() => {
                componentWrapper.setProps({
                    filters: fromJS({
                        period: {
                            start_datetime: '2019-03-10',
                            end_datetime: '2019-03-11',
                        },
                    }),
                })
                setTimeout(() => {
                    expect(statFetchedMock.mock.calls).toMatchSnapshot()
                    done()
                })
            })
        })

        it('should cancel pending fetch when updating', (done) => {
            apiMock.onAny().reply(200, firstResponseTimeStat)
            jest.spyOn(axios.CancelToken, 'source').mockImplementation(
                () =>
                    (({
                        token: undefined,
                        cancel: mockedCancelRequest,
                    } as unknown) as CancelTokenSource)
            )
            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            componentWrapper.setProps({
                filters: fromJS({
                    period: {
                        start_datetime: '2019-03-10',
                        end_datetime: '2019-03-11',
                    },
                }),
            })
            setImmediate(() => {
                expect(mockedCancelRequest).toHaveBeenCalledTimes(2)
                done()
            })
        })
    })

    describe('componentWillUnmount()', () => {
        it('should cancel all pending API requests', () => {
            jest.spyOn(axios.CancelToken, 'source').mockImplementation(
                () =>
                    (({
                        token: undefined,
                        cancel: mockedCancelRequest,
                    } as unknown) as CancelTokenSource)
            )
            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            componentWrapper.unmount()
            expect(mockedCancelRequest).toHaveBeenCalledTimes(2)
        })
    })

    describe('render()', () => {
        it('should render stats', () => {
            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            expect(componentWrapper.dive()).toMatchSnapshot()
        })
    })
})
