import React, {useCallback, useState} from 'react'
import Label from 'pages/common/forms/Label/Label'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'
import MultiLevelSelect from '../TicketFields/components/fields/DropdownField/MultiLevelSelect'

import css from './FeedbackOtherResourcesSelect.less'

const FeedbackOtherResourcesSelect = () => {
    const [isOpen, setIsOpen] = useState(false)

    const onToggle = useCallback(() => {
        setIsOpen(true)
    }, [])

    const handleOnToggle = useCallback(() => {
        setIsOpen(false)
    }, [])

    return (
        <div className={css.container}>
            <MultiLevelSelect
                id={12}
                inputId="test-input-id"
                onChange={() => ({})}
                hasMultipleValues
                choices={[
                    's1::ss1',
                    's1::ss2::c1',
                    's1::ss2::c2',
                    's1::ss3',
                    's2',
                ]}
                values={['s1::ss2::c1', 's1::ss2::c2', 's2']}
                label="dropdown"
                isOpen={isOpen}
                onToggle={handleOnToggle}
            >
                <Label className={css.label}>
                    Should AI Agent have used something else?
                </Label>
                <SelectInputBox
                    placeholder="Select resource"
                    onToggle={onToggle}
                />
            </MultiLevelSelect>
        </div>
    )
}

export default FeedbackOtherResourcesSelect
