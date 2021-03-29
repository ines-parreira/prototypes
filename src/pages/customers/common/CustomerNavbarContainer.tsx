import React, {useEffect, useMemo} from 'react'
import {useLocation, useParams} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {parse} from 'query-string'

import {RootState} from '../../../state/types'
import {fetchViews} from '../../../state/views/actions'
import Navbar from '../../common/components/Navbar.js'

import CustomersNavbarView from './components/CustomersNavbarView.js'

type OwnProps = {
    isLoading: boolean
}

export const CustomerNavbarContainer = ({
    fetchViews,
    isLoading,
}: OwnProps & ConnectedProps<typeof connector>) => {
    const location = useLocation()
    const {viewId} = useParams<{viewId?: string}>()
    const viewIdSearch = useMemo(() => parse(location.search).viewId, [
        location,
    ])

    useEffect(() => {
        void fetchViews(viewId || (viewIdSearch as string))
    }, [viewId, viewIdSearch])

    return (
        <Navbar activeContent="customers">
            <CustomersNavbarView
                settingType="customer-views"
                isLoading={isLoading}
            />
        </Navbar>
    )
}

const connector = connect(
    (state: RootState) => ({
        isLoading: state.currentUser.getIn(
            ['_internal', 'loading', 'settings', 'customer-views'],
            false
        ),
    }),
    {
        fetchViews,
    }
)

export default connector(CustomerNavbarContainer)
