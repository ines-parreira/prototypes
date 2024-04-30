import {useCallback} from 'react'
import {
    HttpResponse,
    ListSlaPolicies200,
    useListSlaPolicies,
} from '@gorgias/api-queries'

import {UISLAPolicy} from '../types'

import makeUISLAPolicy from './makeUISLAPolicy'

export default function useGetSLAPolicies() {
    const transformData = useCallback(
        (data: HttpResponse<ListSlaPolicies200>) =>
            data?.data?.data.map<UISLAPolicy>(makeUISLAPolicy),
        []
    )

    return useListSlaPolicies(undefined, {
        query: {
            select: transformData,
        },
    })
}
