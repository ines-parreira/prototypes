import React, {useRef, useState} from 'react'
import {HelpCenter} from 'models/helpCenter/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Button from 'pages/common/components/button/Button'
import {HELP_CENTER_STATS_TEST_IDS} from '../../pages/tests/constants'
import css from './HelpCenterFilter.less'

type HelpCenterFilterProps = {
    selectedHelpCenter: HelpCenter
    helpCenters: HelpCenter[]
    setSelectedHelpCenter: (helpCenters: {helpCenters: number[]}) => void
}

const HelpCenterFilter = ({
    selectedHelpCenter,
    setSelectedHelpCenter,
    helpCenters,
}: HelpCenterFilterProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)

    const onFilterChange = (helpCenterId: number) => {
        setSelectedHelpCenter({helpCenters: [helpCenterId]})
        setIsOpen(false)
    }

    return (
        <div className={css.wrapper}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                ref={buttonRef}
                intent="secondary"
                data-testid={HELP_CENTER_STATS_TEST_IDS.FILTER}
                className={css.button}
            >
                <span className={css.buttonText}>
                    {selectedHelpCenter.name}
                </span>
                <i className={'material-icons'}>arrow_drop_down</i>
            </Button>
            <Dropdown
                isOpen={isOpen}
                value={selectedHelpCenter.id}
                onToggle={setIsOpen}
                target={buttonRef}
            >
                <DropdownBody>
                    {helpCenters.map((helpCenter) => (
                        <DropdownItem
                            key={helpCenter.id}
                            onClick={() => {
                                onFilterChange(helpCenter.id)
                            }}
                            option={{
                                value: helpCenter.id,
                                label: helpCenter.name,
                            }}
                        >
                            <span className={css.dropdownItemContent}>
                                {helpCenter.name}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

export default HelpCenterFilter
