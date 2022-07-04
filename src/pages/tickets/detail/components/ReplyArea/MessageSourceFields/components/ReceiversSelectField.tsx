import React, {forwardRef} from 'react'
import _debounce from 'lodash/debounce'
import {CancelToken} from 'axios'
import {isValidPhoneNumber} from 'libphonenumber-js'

import {TicketMessageSourceType} from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import {
    getValuePropFromSourceType,
    receiversValueFromState,
    receiversStateFromValue,
    Receiver,
    Receivers,
    ReceiverValue,
} from 'state/ticket/utils'
import {updatePotentialCustomers} from 'state/newMessage/actions'
import {isEmail} from 'utils'
import {SearchResponse, SearchType} from 'models/search/types'

import MultiSelectAsyncField from './MultiSelectAsyncField/MultiSelectAsyncField'

type Props = {
    disabled?: boolean // whether the dropdown should allow user interactions or not
    onChange: (state: any) => void
    sourceType: TicketMessageSourceType
    required?: boolean
    value: Receiver[]
}

const ReceiversSelectField = forwardRef<MultiSelectAsyncField, Props>(
    function ReceiversSelectField(
        {
            disabled = false,
            onChange,
            required = false,
            sourceType,
            value,
        }: Props,
        ref
    ) {
        const dispatch = useAppDispatch()
        const valueProp = getValuePropFromSourceType(sourceType) // the property to display from the object
        const searchType =
            sourceType === TicketMessageSourceType.Phone ||
            sourceType === TicketMessageSourceType.Sms
                ? SearchType.UserChannelPhone
                : SearchType.UserChannelEmail
        const searchRankSource =
            searchType === SearchType.UserChannelPhone
                ? SearchRankSource.CustomerChannelPhone
                : SearchRankSource.CustomerChannelEmail

        const [cancellableUpdatePotentialCustomers] = useCancellableRequest(
            (cancelToken: CancelToken) =>
                async (queryText: string, searchType: SearchType) =>
                    await dispatch(
                        updatePotentialCustomers(
                            queryText,
                            searchType,
                            cancelToken
                        )
                    )
        )

        const searchRank = useSearchRankScenario(searchRankSource)

        const valueFromState = (options: Receiver[]) =>
            receiversValueFromState({to: options}, sourceType).to

        const handleOnChange = (value: ReceiverValue[]) => {
            onChange(
                (receiversStateFromValue({to: value}, sourceType) as Receivers)
                    .to
            )
        }

        const handleOptionSelect = (option: ReceiverValue, index: number) => {
            searchRank.registerResultSelection({
                index,
                id: option.id!,
            })
            searchRank.endScenario()
        }

        const search = _debounce(
            async (
                input: string,
                callback: (options: ReceiverValue[]) => void
            ) => {
                searchRank.endScenario()
                const queryText = input.toLowerCase()

                if (!!input) {
                    searchRank.registerResultsRequest({
                        query: queryText,
                        requestTime: Date.now(),
                    })
                }

                if (!queryText) {
                    callback([])
                }

                const resp = (await cancellableUpdatePotentialCustomers(
                    queryText,
                    searchType
                )) as SearchResponse<Receiver>
                if (!resp?.data) {
                    return
                }

                if (!!input) {
                    searchRank.registerResultsResponse({
                        responseTime: Date.now(),
                        numberOfResults: resp.data.length,
                        searchEngine: resp.searchEngine,
                    })
                    callback(valueFromState(resp.data))
                }
            },
            1000
        )

        const placeholder = valueProp
            ? 'Search a customer...'
            : 'Sorry, no recipient for this type of message...'
        const allowCreate =
            sourceType === TicketMessageSourceType.Email ||
            sourceType === TicketMessageSourceType.Phone ||
            sourceType === TicketMessageSourceType.Sms
        const allowCreateConstraint =
            sourceType === TicketMessageSourceType.Phone ||
            sourceType === TicketMessageSourceType.Sms
                ? isValidPhoneNumber
                : isEmail

        return (
            <MultiSelectAsyncField
                ref={ref}
                value={valueFromState(value)}
                onChange={handleOnChange}
                loadOptions={search}
                disabled={disabled}
                required={required}
                allowCreate={allowCreate}
                allowCreateConstraint={allowCreateConstraint}
                placeholder={placeholder}
                onOptionSelect={handleOptionSelect}
            />
        )
    }
)

export default ReceiversSelectField
