import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import _merge from 'lodash/merge'

import configureStore from '../../../../../store/configureStore'
import * as viewsFixtures from '../../../../../fixtures/views'
import * as ticketFixtures from '../../../../../fixtures/ticket'
import * as viewsActions from '../../../../../state/views/actions'
import Page from '../Page'

jest.mock('../../../../../state/views/actions', () => {
    const _identity = require('lodash/identity')

    return {
        fetchPage: jest.fn(() => _identity),
        setViewActive: jest.fn(() => _identity),
        updateView: jest.fn(() => _identity),
    }
})

describe('ViewTable::Page', () => {
    const fixtureView = viewsFixtures.view

    const minStore = {
        views: fromJS({
            active: fixtureView,
        })
    }

    const minProps = {
        type: 'ticket',
        items: fromJS([ticketFixtures.ticket]),
        isUpdate: true,
        isSearch: false,
        urlViewId: fixtureView.id.toString(), // id of view coming from url
        store: configureStore(minStore),
        location: {
            query: {
                page: 1,
            }
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('connect HOC', () => {
        it('pass correct currentPage prop when page change in url', () => {
            const component = shallow(<Page {...minProps} />).dive()
            expect(component.props()).toHaveProperty('currentPage', 1)
            component.setProps({
                location: {
                    query: {
                        page: 2,
                    }
                },
            })
            expect(component.props()).toHaveProperty('currentPage', 2)
        })
    })

    describe('component', () => {
        it('empty view', () => {
            const component = shallow(
                <Page
                    {...minProps}
                    store={configureStore({
                        ...minStore,
                        views: fromJS({}),
                    })}
                    isUpdate={false}
                />
            ).dive().dive()
            expect(component).toMatchSnapshot()
        })

        it('default view', () => {
            const component = shallow(<Page {...minProps} />).dive().dive()
            expect(component).toMatchSnapshot()
        })

        it('fetch page when page changes', () => {
            const component = shallow(<Page {...minProps} />).dive().dive()
            component.setProps({
                currentPage: 2,
            })
            expect(viewsActions.fetchPage).toBeCalledWith(2)
        })

        it('change view when entering search mode', () => {
            const component = shallow(<Page {...minProps} isSearch={false} />).dive().dive()
            component.setProps({
                isSearch: true,
            })
            expect(viewsActions.updateView).toBeCalled()
            expect(viewsActions.fetchPage).toBeCalledWith(component.instance().props.currentPage)
        })

        it('search again if search query changed while in search mode', () => {
            const component = shallow(
                <Page
                    {...minProps}
                    isSearch={true}
                    location={_merge({}, minProps.location, {
                        query: {
                            q: 'term1',
                        }
                    })}
                />
            ).dive().dive()
            component.setProps({
                location: _merge({}, minProps.location, {
                    query: {
                        q: 'term2',
                    }
                })
            })
            expect(viewsActions.updateView).toBeCalled()
            expect(viewsActions.fetchPage).toBeCalledWith(1)
        })

        it('change view when leaving search mode', () => {
            const component = shallow(<Page {...minProps} isSearch />).dive().dive()
            component.setProps({
                isSearch: false,
            })
            expect(viewsActions.setViewActive).toBeCalled()
            expect(viewsActions.fetchPage).toBeCalledWith(1)
        })

        it('change view when entering "add new" mode', () => {
            const component = shallow(<Page {...minProps} isUpdate />).dive().dive()
            component.setProps({
                isUpdate: false,
            })
            expect(viewsActions.updateView).toBeCalled()
            expect(viewsActions.fetchPage).toBeCalledWith(1)
        })

        it('change view when leaving "add new" mode', () => {
            const component = shallow(<Page {...minProps} isUpdate={false} />).dive().dive()
            component.setProps({
                isUpdate: true,
            })
            expect(viewsActions.setViewActive).toBeCalled()
            expect(viewsActions.fetchPage).toBeCalledWith(1)
        })
    })
})
