import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'
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
    const defaultProps = ({
        notify: notifyMock,
        filters: fromJS({
            period: {
                start_datetime: '2019-03-09',
                end_datetime: '2019-03-10',
            },
        }),
        statFetched: statFetchedMock,
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
        it('should fetch stats and populate the state', (done) => {
            apiMock.onAny().reply(200, firstResponseTimeStat)

            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            const component = componentWrapper.instance()
            expect(component.state).toMatchSnapshot(
                'should contain loading stats'
            )
            setTimeout(() => {
                expect(component.state).toMatchSnapshot(
                    'should contain data of stats and be marked as not loading'
                )
                expect(statFetchedMock.mock.calls).toMatchSnapshot()
                done()
            })
        })

        it('should create a notification (server error) when fetching stats fails', (done) => {
            apiMock.onAny().reply(400, {error: {msg: 'Invalid filters'}})

            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            const component = componentWrapper.instance()
            setTimeout(() => {
                expect(component.state).toMatchSnapshot(
                    'stats should be marked as not loading'
                )
                expect(notifyMock.mock.calls).toMatchSnapshot()
                done()
            })
        })

        it('should create a notification (unknown error) when fetching stats fails', (done) => {
            apiMock.onAny().reply(500)

            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            const component = componentWrapper.instance()
            setTimeout(() => {
                expect(component.state).toMatchSnapshot(
                    'stats should be marked as not loading'
                )
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
                            view: statsViewsConfig.getIn(['agents', 'link']),
                        },
                    },
                })
                const component = componentWrapper.instance()
                expect(component.state).toMatchSnapshot(
                    'should contain loading stats'
                )
                setTimeout(() => {
                    expect(component.state).toMatchSnapshot(
                        'should contain data of stats and be marked as not loading'
                    )
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
                const component = componentWrapper.instance()
                expect(component.state).toMatchSnapshot(
                    'should contain loading stats'
                )
                setTimeout(() => {
                    expect(component.state).toMatchSnapshot(
                        'should contain data of stats and be marked as not loading'
                    )
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
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
            )
            const statNames = statsViewsConfig.getIn([
                'channels',
                'stats',
            ]) as List<any>
            const component = componentWrapper.instance()
            component.setState({
                fetchingStates: statNames.reduce(
                    (loaders, statName: string) => loaders!.set(statName, true),
                    fromJS({}) as Map<any, any>
                ),
                stats: fromJS({}),
            })
            expect(componentWrapper.dive()).toMatchSnapshot()
        })

        it("should not render stats because there is no stat to render and it's not fetching stats", () => {
            const componentWrapper = shallow(
                <StatsContainer
                    {...defaultProps}
                    match={{params: {view: channelsStatView}} as any}
                />
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
