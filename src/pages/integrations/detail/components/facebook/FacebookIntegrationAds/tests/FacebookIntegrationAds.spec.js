import {fromJS} from 'immutable'
import {mount} from 'enzyme'
import React from 'react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../../constants/integration'
import FacebookIntegrationAds from '../'

describe('FacebookIntegrationAds component', () => {
    const integrations = [{
        id: 1,
        name: 'integration 1',
        type: FACEBOOK_INTEGRATION_TYPE,
        created_datetime: '2019-01-01 00:00:00'
    }]

    const props = {
        integrations: fromJS(integrations),
        integration: fromJS(integrations[0]),
        fetchAds: () => null,
        updateAd: () => null,
    }

    const getStore = ({maxAccountAds, internal, loading}) => {
        const middlewares = [thunk]
        const mockStore = configureMockStore(middlewares)

        return mockStore({
            currentUser: fromJS({
                timezone: 'America/Los_Angeles'
            }),
            integrations: fromJS({
                integrations,
                extra: {
                    facebook: {
                        max_account_ads: maxAccountAds
                    }
                }
            }),
            facebookAds: fromJS({
                loading: loading || false,
                internals: {
                    1: internal,
                },
                loadingAds: [],
            })
        })
    }

    // Tooltips
    const tooltipIds = ['active-ads-tooltip', 'datetime-tooltip-pjpsszd2icb']
    const random = Math.random

    beforeAll(() => {
        tooltipIds.forEach((tooltipId) => {
            const tooltipDiv = document.createElement('div')
            tooltipDiv.setAttribute('id', tooltipId)
            document.body.appendChild(tooltipDiv)
        })

        global.Math.random = () => 0.709657924825722 // ID will be `pjpsszd2icb`
    })

    afterAll(() => {
        tooltipIds.forEach((tooltipId) => {
            document.getElementById(tooltipId).remove()
        })

        global.Math.random = random
    })

    it('should render a spinner', () => {
        const component = mount(
            <FacebookIntegrationAds
                store={getStore({
                    loading: true,
                    maxAccountAds: 100,
                    internal: {
                        ads: {}
                    }
                })}
                {...props}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render without ad', () => {
        const component = mount(
            <FacebookIntegrationAds
                store={getStore({
                    maxAccountAds: 100,
                    internal: {
                        ads: {}
                    }
                })}
                {...props}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with one ad', () => {
        const component = mount(
            <FacebookIntegrationAds
                store={getStore({
                    maxAccountAds: 100,
                    internal: {
                        ads: {
                            postid1: {
                                comments_fetched_at: '2019-01-01 10:30:00',
                                name: 'ad 1',
                                is_active: true
                            }
                        }
                    }
                })}
                {...props}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with two ads (one not active)', () => {
        const component = mount(
            <FacebookIntegrationAds
                store={getStore({
                    maxAccountAds: 100,
                    internal: {
                        ads: {
                            postid1: {
                                comments_fetched_at: '2019-01-01 10:30:00',
                                name: 'ad 1',
                                is_active: true
                            },
                            postid2: {
                                comments_fetched_at: '2019-01-01 10:30:00',
                                name: 'ad 2',
                                is_active: false
                            }
                        }
                    }
                })}
                {...props}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with ads limit reached', () => {
        const component = mount(
            <FacebookIntegrationAds
                store={getStore({
                    maxAccountAds: 2,
                    internal: {
                        ads: {
                            postid1: {
                                comments_fetched_at: '2019-01-01 10:30:00',
                                name: 'ad 1',
                                is_active: true
                            },
                            postid2: {
                                comments_fetched_at: '2019-01-01 10:30:00',
                                name: 'ad 2',
                                is_active: true
                            },
                            postid3: {
                                comments_fetched_at: '2019-01-01 10:30:00',
                                name: 'ad 3',
                                is_active: false
                            }
                        }
                    }
                })}
                {...props}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with one active ad, when the comments have not been fetched yet', () => {
        const component = mount(
            <FacebookIntegrationAds
                store={getStore({
                    maxAccountAds: 100,
                    internal: {
                        ads: {
                            postid1: {
                                comments_fetched_at: null,
                                name: 'ad 1',
                                is_active: true
                            }
                        }
                    }
                })}
                {...props}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
