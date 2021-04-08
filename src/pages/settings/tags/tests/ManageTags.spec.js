import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {ManageTags} from '../ManageTags'
import Loader from '../../../common/components/Loader/Loader.tsx'
import Pagination from '../../../common/components/Pagination.tsx'

describe('ManageTags component', () => {
    let component
    let tagData

    beforeEach(() => {
        tagData = fromJS({
            items: [
                {
                    id: 1,
                    name: 'refund',
                },
                {
                    id: 2,
                    name: 'billing',
                },
                {
                    id: 3,
                    name: 'shipping',
                },
            ],
            meta: {
                1: {
                    selected: true,
                },
                2: {
                    selected: true,
                },
            },
            _internal: {
                pagination: {
                    per_page: 30,
                    page: 1,
                    nb_pages: 1,
                    item_count: 3,
                    current_page: '/api/views/?page=1',
                },
            },
        })

        component = shallow(
            <ManageTags
                tagsState={tagData}
                tags={tagData.get('items')}
                meta={tagData.get('meta')}
                currentPage={1}
                numberPages={1}
                fetch={() => Promise.resolve()}
                create={() => Promise.resolve()}
                remove={() => Promise.resolve()}
                selectAll={() => Promise.resolve()}
                setPage={() => Promise.resolve()}
                merge={() => Promise.resolve()}
                bulkDelete={() => Promise.resolve()}
            />
        )
    })

    it('mounts correctly', () => {
        expect(component).toMatchSnapshot()
    })

    it('should display loader when fetching tags', () => {
        component.setState({isFetching: true})
        expect(component.matchesElement(<Loader />)).toEqual(true)
    })

    it('should not display pagination when there is one page of tags', () => {
        expect(component.find(Pagination).dive().isEmptyRender()).toEqual(true)
    })

    it('should display pagination when there are more than one page of tags', () => {
        component.setProps({numberPages: 2})
        expect(component.find(Pagination).dive().isEmptyRender()).toEqual(false)
    })

    describe('Create Tags feature', () => {
        it('should display create field when create button is toggled', () => {
            component.instance()._toggleCreationPopup()
            expect(component.instance().state.showCreationPopup).toEqual(true)
        })
    })
})
