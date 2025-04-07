import { List, Map } from 'immutable'
import { DropdownItem } from 'reactstrap'

import { isImmutable } from 'common/utils'
import { ViewField } from 'models/view/types'
import { RenderLabel } from 'pages/common/utils/labels'
import { getDisplayName } from 'state/customers/helpers'
import { humanizeChannel } from 'state/ticket/utils'
import { getLanguageDisplayName } from 'utils'

import css from './FilterDropdownItems.less'

type Props = {
    field: Map<any, any>
    items: Maybe<List<any>>
    isLoading: boolean
    onItemClick: (newValue: Record<string, unknown>) => void
    onMeItemClick: () => void
}

export default function FilterDropdownItems({
    field,
    isLoading,
    onItemClick,
    onMeItemClick,
    items,
}: Props) {
    if (isLoading) {
        return (
            <DropdownItem disabled>
                <i className="material-icons md-spin mr-2">refresh</i>
                Loading...
            </DropdownItem>
        )
    }

    if (!items) {
        return null
    }

    if (items.isEmpty()) {
        return (
            <DropdownItem header>
                Could not find anything like this
            </DropdownItem>
        )
    }

    const fieldName = field.get('name')

    let options = items.map((value, key) => {
        let renderValue = value

        // special displays for some columns in the dropdown
        if (fieldName === ViewField.Tags) {
            // display tags as tags
            renderValue = value.get('name')
        } else if (fieldName === ViewField.Customer) {
            renderValue = getDisplayName(value)
        } else if (fieldName === ViewField.Language) {
            renderValue = getLanguageDisplayName(value)
        } else if (typeof value === 'object' || fieldName === 'role') {
            renderValue = <RenderLabel field={field} value={value} />
        } else if (fieldName === ViewField.Channel) {
            renderValue = humanizeChannel(value)
        }

        const passedValue = isImmutable(value) ? value.toJS() : value

        return (
            <DropdownItem
                key={key}
                type="button"
                onClick={() => onItemClick(passedValue)}
                className={css.dropdownItem}
            >
                {renderValue}
            </DropdownItem>
        )
    }) as List<any>

    // special option added for some columns in the dropdown
    if (fieldName === ViewField.Assignee) {
        options = options.unshift(
            <DropdownItem
                key="me"
                type="button"
                onClick={() => onMeItemClick()}
            >
                Me (current user)
            </DropdownItem>,
            <DropdownItem key="unassigned-divider" divider />,
        )
    }

    return <>{options}</>
}
