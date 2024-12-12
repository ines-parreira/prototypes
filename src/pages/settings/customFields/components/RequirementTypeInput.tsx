import {Label} from '@gorgias/merchant-ui-kit'
import React from 'react'
import {Link} from 'react-router-dom'

import {CustomFieldRequirementType} from 'custom-fields/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import css from 'pages/settings/customFields/components/RequirementTypeInput.less'

interface RequirementTypeInputProps {
    className?: string
    value?: CustomFieldRequirementType
    onChange: (value: CustomFieldRequirementType) => void
}

export default function RequirementTypeInput(props: RequirementTypeInputProps) {
    return (
        <div className={props.className}>
            <Label className="mb-2">Field visibility</Label>
            <p className="mb-2">
                Configure fields to always appear, or only when specific
                conditions are met. See conditional visibility of Optional or
                Required within conditions settings page.
            </p>
            <p className="mb-4">
                <a
                    href="https://docs.gorgias.com/en-US/articles/ticket-fields-63498"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="material-icons mr-1">menu_book</i>
                    Learn more about field visibility
                </a>
            </p>

            <div className={css.radioBoxList}>
                <PreviewRadioButton
                    value="visible"
                    className={css.radioBox}
                    isSelected={!props.value || props.value === 'visible'}
                    label="Always optional"
                    caption="Field is always visible to agent, not required to close ticket. Ignores all conditions."
                    onClick={() => props.onChange('visible')}
                />
                <PreviewRadioButton
                    value="required"
                    className={css.radioBox}
                    isSelected={props.value === 'required'}
                    label="Always required"
                    caption="Field is always visible to agent, and mandatory to close ticket. Ignores all conditions."
                    onClick={() => props.onChange('required')}
                />
                <PreviewRadioButton
                    value="conditional"
                    className={css.radioBox}
                    isSelected={props.value === 'conditional'}
                    label="Conditionally visible"
                    caption={
                        <>
                            <Badge type={ColorType.Blue}>BETA</Badge>
                            <p className="mt-1 mb-0">
                                Display to agents only when conditions are met.
                                <br />
                                <Link to="/app/settings/ticket-field-conditions">
                                    Go to field conditions
                                </Link>
                            </p>
                        </>
                    }
                    onClick={() => props.onChange('conditional')}
                />
            </div>
        </div>
    )
}
