import React, {memo, useCallback} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import debounce from 'lodash/debounce'

import {FeatureFlagKey} from 'config/featureFlags'

// import useAppSelector from 'hooks/useAppSelector'
import {CustomField, CustomFieldValue} from 'models/customField/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {updateCustomFieldValue} from 'state/ticket/actions'

import {StoreDispatch} from 'state/types'
import TicketField from './TicketField'
import css from './TicketFields.less'

const fakeCustomFieldsData: CustomField[] = [
    {
        id: 1,
        created_datetime: '2022-12-16T10:34:27.490915+00:00',
        updated_datetime: '2022-12-16T13:41:08.944435+00:00',
        deactivated_datetime: null,
        object_type: 'Ticket',
        label: 'Dispositions',
        description: 'useless field',
        priority: 1,
        required: true,
        definition: {
            data_type: 'text',
            input_settings: {
                input_type: 'input',
                placeholder: 'plholder',
            },
        },
    },
    {
        id: 2,
        created_datetime: '2022-12-16T10:34:27.490915+00:00',
        updated_datetime: '2022-12-16T13:41:08.944435+00:00',
        deactivated_datetime: null,
        object_type: 'Ticket',
        label: 'Resolution',
        description: 'useless field',
        priority: 2,
        required: true,
        definition: {
            data_type: 'text',
            input_settings: {
                input_type: 'dropdown',
                choices: [
                    'Choice 1',
                    'Choice 2',
                    'Category 1::Sub-category 1::Choice 1',
                    'Category 1::Sub-category 1::Choice 2',
                    'Category 1::Sub-category 1::Sub-Sub-category 1::Choice 1',
                    'Category 1::Sub-category 1::Choice 3',
                    'Category 1::Sub-category 2::Sub-Sub-category 1::Choice 1',
                    'Category 1::Sub-category 2::Sub-Sub-category 1::Choice 2',
                    'Category 1::Sub-category 3::',
                    'Category 2::Choice 1',
                    'Category 2::Choice 2',
                    'Category 2::Choice 3',
                    'Category 2::Choice 4',
                    'Category 2::Choice 5',
                    'Category 2::Choice 6',
                    'Category 2::Choice 7',
                    'Category 2::Choice 8',
                    'Category 2::Choice 9',
                    'Category 2::Choice 10',
                ],
            },
        },
    },
    {
        id: 3,
        created_datetime: '2022-12-16T10:34:27.490915+00:00',
        updated_datetime: '2022-12-16T13:41:08.944435+00:00',
        deactivated_datetime: null,
        object_type: 'Ticket',
        label: 'Region',
        description: 'useless field',
        priority: 3,
        required: false,
        definition: {
            data_type: 'text',
            input_settings: {
                input_type: 'dropdown',
                choices: [
                    'Choice 1',
                    'Choice 2',
                    'Category 1::Sub-category 1::Choice 1',
                    'Category 1::Sub-category 1::Choice 2',
                    'Category 1::Sub-category 1::Sub-Sub-category 1::Choice 1',
                    'Category 1::Sub-category 1::Choice 3',
                    'Category 1::Sub-category 2::Sub-Sub-category 1::Choice 1',
                    'Category 1::Sub-category 2::Sub-Sub-category 1::Choice 2',
                    'Category 1::Sub-category 3::',
                    'Category 2::Choice 1',
                    'Category 2::Choice 2',
                    'Category 2::Choice 3',
                    'Category 2::Choice 4',
                    'Category 2::Choice 5',
                    'Category 2::Choice 6',
                    'Category 2::Choice 7',
                    'Category 2::Choice 8',
                    'Category 2::Choice 9',
                    'Category 2::Choice 10',
                ],
            },
        },
    },
    {
        id: 4,
        created_datetime: '2022-12-16T10:34:27.490915+00:00',
        updated_datetime: '2022-12-16T13:41:08.944435+00:00',
        deactivated_datetime: null,
        object_type: 'Ticket',
        label: 'Note',
        description: 'useless field',
        priority: 4,
        required: false,
        definition: {
            data_type: 'text',
            input_settings: {
                input_type: 'input',
            },
        },
    },
]

const ANTI_LAG_SPAM_DELAY = 300

function dispatchCustomFieldsUpdate(
    dispatch: StoreDispatch,
    newValue: CustomFieldValue['value'],
    id: CustomFieldValue['id']
) {
    void dispatch(updateCustomFieldValue(newValue, id))
}

// useful to have immediate feedback on change
// for fully controlled components
const leadingDebouncedCustomFieldsUpdate = debounce(
    dispatchCustomFieldsUpdate,
    ANTI_LAG_SPAM_DELAY,
    {leading: true}
)

const debouncedCustomFieldsUpdate = debounce(
    dispatchCustomFieldsUpdate,
    ANTI_LAG_SPAM_DELAY
)

function TicketFields() {
    // get config here once available in redux
    // const ticketFieldsConfig = useAppSelector(getCustomFieldsConfig)
    const dispatch = useAppDispatch()

    // spamming actions here makes the helpdesk laggy, hence the debounce
    const handleChange = useCallback(
        (
            leading: boolean,
            ...params: [CustomFieldValue['value'], CustomFieldValue['id']]
        ) =>
            leading
                ? leadingDebouncedCustomFieldsUpdate(dispatch, ...params)
                : debouncedCustomFieldsUpdate(dispatch, ...params),
        [dispatch]
    )

    const ticketFieldsEnabled = useFlags()[FeatureFlagKey.TicketFields]
    if (!ticketFieldsEnabled) {
        return null
    }

    return (
        <div className={css.wrapper}>
            {fakeCustomFieldsData
                .sort(
                    ({priority: previousPriority}, {priority: nextPriority}) =>
                        previousPriority - nextPriority
                )
                .map((fieldData) => {
                    return (
                        <TicketField
                            key={fieldData.id}
                            fieldData={fieldData}
                            onChange={handleChange}
                        />
                    )
                })}
        </div>
    )
}

// Prevent crazy amount of renders coming from parent
export default memo(TicketFields)
