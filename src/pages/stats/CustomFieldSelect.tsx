import classnames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {ListParams} from 'models/customField/types'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {
    getSelectedCustomFieldId,
    setSelectedCustomFieldId,
} from 'state/ui/stats/ticketInsightsSlice'

const activeParams: ListParams = {
    archived: false,
    object_type: 'Ticket',
}

export const SELECT_FIELD_LABEL = 'Select field'

export const CustomFieldSelect = () => {
    const selectedCustomFieldId = useAppSelector(getSelectedCustomFieldId)
    const dispatch = useAppDispatch()

    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)

    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)
    const selectedField = activeFields.find(
        (field) => field.id === selectedCustomFieldId
    )

    useEffect(() => {
        activeFields[0] !== undefined &&
            dispatch(setSelectedCustomFieldId(activeFields[0].id))
    }, [activeFields, dispatch])

    return activeFields.length > 1 ? (
        <>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                ref={buttonRef}
                intent={'secondary'}
            >
                {selectedField?.label || SELECT_FIELD_LABEL}
                <i className={classnames('material-icons')}>arrow_drop_down</i>
            </Button>

            <Dropdown
                isOpen={isOpen}
                onToggle={setIsOpen}
                target={buttonRef}
                value={selectedCustomFieldId}
            >
                {activeFields.map((field) => (
                    <DropdownItem
                        key={field.id}
                        onClick={() => {
                            dispatch(setSelectedCustomFieldId(field.id))
                            setIsOpen(false)
                        }}
                        option={{value: field.id, label: field.label}}
                    />
                ))}
            </Dropdown>
        </>
    ) : null
}
