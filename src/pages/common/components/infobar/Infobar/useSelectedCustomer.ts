import {fromJS} from 'immutable'
import {useState} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {SearchRank} from 'hooks/useSearchRankScenario'
import {ApiListResponsePagination} from 'models/api/types'
import {Customer} from 'models/customer/types'
import * as infobarActions from 'state/infobar/actions'
import * as infobarConstants from 'state/infobar/constants'

export const useSelectedCustomer = (searchRank: SearchRank) => {
    const dispatch = useAppDispatch()
    const [selectedCustomer, setSelectedCustomer] = useState(fromJS({}))
    const [isFetchingCustomer, setIsFetchingCustomer] = useState(false)
    const [displaySelectedCustomer, setDisplaySelectedCustomer] =
        useState(false)

    const onSearchResultClick = async (customerId: number, index: number) => {
        searchRank.registerResultSelection({index, id: customerId})
        setIsFetchingCustomer(true)
        const result = (await dispatch(
            infobarActions.fetchPreviewCustomer(String(customerId))
        )) as {
            type: string
            resp: ApiListResponsePagination<Customer[]>
        }
        if (result?.type === infobarConstants.FETCH_PREVIEW_CUSTOMER_SUCCESS) {
            setDisplaySelectedCustomer(true)
            setSelectedCustomer(fromJS(result.resp))
        }
        setIsFetchingCustomer(false)
    }

    return {
        displaySelectedCustomer,
        isFetchingCustomer,
        selectedCustomer,
        setSelectedCustomer,
        onSearchResultClick,
        setDisplaySelectedCustomer,
    }
}
