import React, {forwardRef} from 'react'
import _debounce from 'lodash/debounce'
import {CancelToken} from 'axios'

import {TicketMessageSourceType} from '../../../../../../../business/types/ticket'
import useAppDispatch from '../../../../../../../hooks/useAppDispatch'
import useCancellableRequest from '../../../../../../../hooks/useCancellableRequest'
import {
    getValuePropFromSourceType,
    receiversValueFromState,
    receiversStateFromValue,
    Receiver,
    Receivers,
    ReceiverValue,
} from '../../../../../../../state/ticket/utils'
import {updatePotentialCustomers} from '../../../../../../../state/newMessage/actions'
import {isEmail} from '../../../../../../../utils'

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

        const [
            cancellableUpdatePotentialCustomers,
        ] = useCancellableRequest(
            (cancelToken: CancelToken) => async (queryText: string) =>
                await dispatch(updatePotentialCustomers(queryText, cancelToken))
        )

        const valueFromState = (options: Receiver[]) =>
            receiversValueFromState({to: options}, sourceType).to

        const handleOnChange = (value: ReceiverValue[]) => {
            onChange(
                (receiversStateFromValue({to: value}, sourceType) as Receivers)
                    .to
            )
        }

        const search = _debounce(
            async (
                input: string,
                callback: (options: ReceiverValue[]) => void
            ) => {
                const queryText = input.toLowerCase()

                if (!queryText) {
                    callback([])
                }

                const data = (await cancellableUpdatePotentialCustomers(
                    queryText
                )) as Receiver[]
                if (!data) {
                    return
                }
                callback(valueFromState(data))
            },
            1000
        )

        const placeholder = valueProp
            ? 'Search a customer...'
            : 'Sorry, no recipient for this type of message...'

        return (
            <MultiSelectAsyncField
                ref={ref}
                value={valueFromState(value)}
                onChange={handleOnChange}
                loadOptions={search}
                disabled={disabled}
                required={required}
                allowCreate={sourceType === 'email'}
                allowCreateConstraint={isEmail}
                placeholder={placeholder}
            />
        )
    }
)

export default ReceiversSelectField
