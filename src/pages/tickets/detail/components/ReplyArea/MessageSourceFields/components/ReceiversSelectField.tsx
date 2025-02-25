import React, { ForwardedRef, forwardRef } from 'react'

import { CancelToken } from 'axios'
import { isValidPhoneNumber } from 'libphonenumber-js'
import _debounce from 'lodash/debounce'

import { TicketMessageSourceType } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import { SearchResponse, SearchType } from 'models/search/types'
import { updatePotentialCustomers } from 'state/newMessage/actions'
import {
    Receiver,
    Receivers,
    receiversStateFromValue,
    receiversValueFromState,
    ReceiverValue,
} from 'state/ticket/utils'
import {
    getValuePropFromSourceType,
    isPhoneBasedSource,
} from 'tickets/common/utils'
import { isEmail } from 'utils'

import MultiSelectAsyncField from './MultiSelectAsyncField/MultiSelectAsyncField'

type Props = {
    tabIndex?: number
    disabled?: boolean // whether the dropdown should allow user interactions or not
    onChange: (state: any) => void
    sourceType: TicketMessageSourceType
    required?: boolean
    value: Receiver[]
    placeholder?: string
    disableSearch?: boolean
}

const ReceiversSelectField = function ReceiversSelectField(
    {
        tabIndex,
        disabled = false,
        onChange,
        required = false,
        sourceType,
        value,
        placeholder,
        disableSearch,
    }: Props,
    ref: ForwardedRef<MultiSelectAsyncField>,
) {
    const dispatch = useAppDispatch()
    const valueProp = getValuePropFromSourceType(sourceType) // the property to display from the object
    const searchType = isPhoneBasedSource(sourceType)
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
                        cancelToken,
                    ),
                ),
    )

    const searchRank = useSearchRankScenario(searchRankSource)

    const valueFromState = (options: Receiver[]) =>
        receiversValueFromState({ to: options }, sourceType).to

    const handleOnChange = (value: ReceiverValue[]) => {
        onChange(
            (receiversStateFromValue({ to: value }, sourceType) as Receivers)
                .to,
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
        async (input: string, callback: (options: ReceiverValue[]) => void) => {
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
                searchType,
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
        300,
    )

    const _placeholder =
        placeholder ??
        (valueProp
            ? `Search customers${
                  searchType === SearchType.UserChannelPhone
                      ? ' or enter a number'
                      : ''
              }...`
            : 'Sorry, no recipient for this type of message...')
    const allowCreate =
        sourceType === TicketMessageSourceType.Email ||
        isPhoneBasedSource(sourceType)
    const allowCreateConstraint = isPhoneBasedSource(sourceType)
        ? isValidPhoneNumber
        : isEmail

    return (
        <MultiSelectAsyncField
            ref={ref}
            tabIndex={tabIndex}
            value={valueFromState(value)}
            onChange={handleOnChange}
            loadOptions={disableSearch ? undefined : search}
            disabled={disabled}
            required={required}
            allowCreate={allowCreate}
            allowCreateConstraint={allowCreateConstraint}
            placeholder={_placeholder}
            onOptionSelect={handleOptionSelect}
        />
    )
}

export default forwardRef<MultiSelectAsyncField, Props>(ReceiversSelectField)
