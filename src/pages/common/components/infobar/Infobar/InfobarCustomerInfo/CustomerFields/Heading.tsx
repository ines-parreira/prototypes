import {Tooltip} from '@gorgias/ui-kit'
import classnames from 'classnames'
import React from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {OBJECT_TYPES} from 'custom-fields/constants'
import useAppSelector from 'hooks/useAppSelector'
import useId from 'hooks/useId'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {CUSTOM_FIELD_ROUTES} from 'routes/constants'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isAdmin} from 'utils'

import css from './Heading.less'

const handleAddCustomerFields = () => {
    logEvent(SegmentEvent.CustomFieldCustomerAddFieldsClicked)
}

export function Heading() {
    const currentUser = useAppSelector(getCurrentUser)
    const userIsAdmin = isAdmin(currentUser)

    const id = useId()
    const tooltipId = 'customer-field-title-' + id

    const Title = <span className={css.title}>Customer Fields</span>
    return (
        <div className={css.container}>
            {userIsAdmin ? (
                <a
                    href={`/app/settings/${
                        CUSTOM_FIELD_ROUTES[OBJECT_TYPES.CUSTOMER]
                    }/add`}
                    onClick={handleAddCustomerFields}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uncolored"
                >
                    {Title}
                    <i className={classnames('material-icons', css.icon)}>
                        open_in_new
                    </i>
                </a>
            ) : (
                <>
                    <span>
                        {Title}
                        <i
                            id={tooltipId}
                            className={classnames(
                                'material-icons-outlined',
                                css.icon
                            )}
                        >
                            info
                        </i>
                        <Tooltip target={tooltipId}>
                            Add customer attributes here.
                            <br />
                            Reach out to your admin for setup.
                        </Tooltip>
                    </span>
                </>
            )}
            <Badge type={ColorType.Blue} className="">
                NEW
            </Badge>
        </div>
    )
}
