import { useCallback, useMemo } from 'react'

import { List, Map } from 'immutable'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import CheckBox from 'pages/common/forms/CheckBox'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { setFieldVisibility } from 'state/views/actions'

type Props = {
    config: Map<any, any>
    fields: List<any>
    visibleFields: List<any>
    shouldStoreFieldConfig: boolean
}

const ShowMoreFieldsDropdown = ({
    config,
    fields,
    visibleFields,
    shouldStoreFieldConfig,
}: Props) => {
    const dispatch = useAppDispatch()

    const handleFieldVisibility = useCallback(
        (name: string, state: boolean) => {
            if (!state && visibleFields.size <= 1) {
                return dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'You can not remove all columns of a view',
                    }),
                )
            }

            return dispatch(
                setFieldVisibility(name, state, shouldStoreFieldConfig),
            )
        },
        [visibleFields.size, dispatch, shouldStoreFieldConfig],
    )

    const visibleFieldsNames = useMemo(
        () =>
            visibleFields.map(
                (field: Map<any, any>) => field.get('name') as string,
            ),
        [visibleFields],
    )

    return (
        <UncontrolledDropdown
            className="d-flex"
            onClick={() => {
                logEvent(SegmentEvent.ShowMoreFieldsClicked)
            }}
        >
            <DropdownToggle
                className="d-none d-md-inline-block text-secondary"
                color="link"
                type="button"
                caret
            >
                <i className="icon material-icons md-2">view_column</i>
            </DropdownToggle>
            <DropdownMenu right>
                <DropdownItem className="pb-2" header>
                    COLUMNS
                </DropdownItem>
                {fields.map((field: Map<any, any>) => {
                    const isMandatory =
                        config.get('mainField') === field.get('name')
                    const isChecked =
                        visibleFieldsNames.includes(field.get('name')) ||
                        isMandatory
                    const setVisibility = (value: boolean) =>
                        handleFieldVisibility(field.get('name'), value)

                    return (
                        <DropdownItem
                            key={field.get('name')}
                            tag="label"
                            className="pt-1 pb-1 mb-0"
                            toggle={false}
                            disabled={isMandatory}
                        >
                            <CheckBox
                                isChecked={isChecked}
                                onChange={setVisibility}
                                isDisabled={isMandatory}
                            >
                                {field.get('title')}
                            </CheckBox>
                        </DropdownItem>
                    )
                })}
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

export default ShowMoreFieldsDropdown
