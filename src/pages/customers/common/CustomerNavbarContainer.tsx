import React, {useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

import {UserSettingType} from 'config/types/user'

import useSearch from '../../../hooks/useSearch'
import {RootState} from '../../../state/types'
import {fetchViews} from '../../../state/views/actions'
import Navbar from '../../common/components/Navbar'

import CustomersNavbarView from './components/CustomersNavbarView'

type OwnProps = {
    isLoading: boolean
}

export const CustomerNavbarContainer = ({
    fetchViews,
    isLoading,
}: OwnProps & ConnectedProps<typeof connector>) => {
    const {viewId} = useParams<{viewId?: string}>()
    const {viewId: viewIdSearch} = useSearch<{viewId?: string}>()

    useEffect(() => {
        void fetchViews(viewId || (viewIdSearch as string))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewId, viewIdSearch])

    return (
        <Navbar activeContent="customers">
            <CustomersNavbarView
                settingType={UserSettingType.CutomerViews}
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
