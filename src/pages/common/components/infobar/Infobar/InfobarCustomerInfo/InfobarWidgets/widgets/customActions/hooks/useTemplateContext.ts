import {useContext, useMemo} from 'react'

import {CURRENT_USER_TEMPLATE_FIELDS} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/constants'
import useAppSelector from 'hooks/useAppSelector'
import {Source, isSourceRecord} from 'models/widget/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {AppContext} from 'providers/infobar/AppContext'
import WidgetListContext from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/WidgetListContext'
import {getTicket} from 'state/ticket/selectors'
import {getActiveCustomer} from 'state/customers/selectors'
import {getCurrentUserState} from 'state/currentUser/selectors'

export function useTemplateContext(source?: Source) {
    const ticket = useAppSelector(getTicket)
    const customer = useAppSelector(getActiveCustomer)
    const currentUser = useAppSelector(getCurrentUserState)
    const {integrationId} = useContext(IntegrationContext)
    const {appId} = useContext(AppContext)
    const {currentListIndex} = useContext(WidgetListContext)
    const templateContext = useMemo(() => {
        const fullCurrentUserData = currentUser.toJS() as Record<
            string,
            unknown
        >
        const trimmedCurrentUserData: Partial<
            Record<typeof CURRENT_USER_TEMPLATE_FIELDS[number], unknown>
        > = {}

        CURRENT_USER_TEMPLATE_FIELDS.forEach((field) => {
            trimmedCurrentUserData[field] = fullCurrentUserData[field]
        })
        return {
            context: {
                ...(isSourceRecord(source) ? source : {}),
                ticket,
                customer,
                current_user: trimmedCurrentUserData,
            },
            variables: {
                listIndex:
                    currentListIndex !== null
                        ? currentListIndex.toString()
                        : undefined,
                integrationId: integrationId?.toString(),
                appId: appId || undefined,
            },
        }
    }, [
        customer,
        source,
        ticket,
        integrationId,
        appId,
        currentListIndex,
        currentUser,
    ])
    return templateContext
}
