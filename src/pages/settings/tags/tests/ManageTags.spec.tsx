import React, {ComponentProps} from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import {fromJS} from 'immutable'
import {TagsState} from 'state/tags/types'

import Loader from '../../../common/components/Loader/Loader'
import Pagination from '../../../common/components/Pagination'
import {ManageTagsContainer} from '../ManageTags'

describe('ManageTags component', () => {
    const mockedCancelFetchTagsCancellable = jest.fn()
    const mockIsCreating = jest.fn()

    const tagData: TagsState = fromJS({
        meta: {
            1: {
                selected: true,
            },
            2: {
                selected: true,
            },
        },
    })

    const minProps: ComponentProps<typeof ManageTagsContainer> = {
        meta: tagData.get('meta'),
        currentPage: 1,
        numberPages: 1,
        isCreating: mockIsCreating(),
        cancelFetchTagsCancellable: mockedCancelFetchTagsCancellable,
        fetchTagsCancellable: () =>
            Promise.resolve() as unknown as Promise<any>,
        create: jest.fn(),
        remove: jest.fn(),
        selectAll: jest.fn(),
        setPage: jest.fn(),
        merge: jest.fn(),
        bulkDelete: jest.fn(),
    }

    let component: ShallowWrapper<
        ComponentProps<typeof ManageTagsContainer>,
        any,
        ManageTagsContainer
    >

    beforeEach(() => {
        component = shallow(<ManageTagsContainer {...minProps} />)
        jest.resetAllMocks()
    })

    it('mounts correctly', () => {
        expect(component).toMatchSnapshot()
    })

    it('should cancel tags fetching when unmounting', () => {
        component.unmount()

        expect(mockedCancelFetchTagsCancellable).toHaveBeenCalled()
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
