import { useEffect } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'

import { ActiveContent, Navbar } from 'common/navigation'
import { UserSettingType } from 'config/types/user'
import { useSearch } from 'hooks/useSearch'
import { ViewType } from 'models/view/types'

import { RootState } from '../../../state/types'
import { fetchViews } from '../../../state/views/actions'
import { CustomersNavbarView } from './components/CustomersNavbarView'

type OwnProps = {
    isLoading: boolean
}

export const CustomerNavbarContainer = ({
    fetchViews,
    isLoading,
}: OwnProps & ConnectedProps<typeof connector>) => {
    const { viewId } = useParams<{ viewId?: string }>()
    const { viewId: viewIdSearch } = useSearch<{ viewId?: string }>()

    useEffect(() => {
        void fetchViews(viewId || (viewIdSearch as string))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewId, viewIdSearch])

    return (
        <Navbar activeContent={ActiveContent.Customers} title="Customers">
            <CustomersNavbarView
                viewType={ViewType.CustomerList}
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
            false,
        ),
    }),
    {
        fetchViews,
    },
)

export default connector(CustomerNavbarContainer)
