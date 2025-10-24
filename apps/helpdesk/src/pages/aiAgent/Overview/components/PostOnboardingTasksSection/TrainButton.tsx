import { useRef } from 'react'

import _noop from 'lodash/noop'

import DropdownButton from 'pages/common/components/button/DropdownButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import css from './TrainSection.less'

type Props = {
    isLoadingGuidanceArticles: boolean
    guidanceArticlesLength: number
    setIsGuidanceTemplatesModalOpen: (arg1: boolean) => void
    onCustomGuidanceClick: () => void
}

export const TrainButton = ({
    isLoadingGuidanceArticles,
    guidanceArticlesLength,
    setIsGuidanceTemplatesModalOpen,
    onCustomGuidanceClick,
}: Props) => {
    const dropdownTargetRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <DropdownButton
                className={css.dropdownButton}
                intent="primary"
                fillStyle="fill"
                onToggleClick={_noop}
                size="medium"
                ref={dropdownTargetRef}
                customIcon="keyboard_arrow_down"
                isDisabled={isLoadingGuidanceArticles}
            >
                {guidanceArticlesLength > 0
                    ? 'Add Guidance'
                    : 'Create Guidance'}
            </DropdownButton>
            <UncontrolledDropdown
                target={dropdownTargetRef}
                placement="bottom-end"
            >
                <DropdownBody>
                    <DropdownItem
                        option={{
                            label: 'Start from template',
                            value: 'start_from_template',
                        }}
                        onClick={() => setIsGuidanceTemplatesModalOpen(true)}
                        shouldCloseOnSelect
                    />
                    <DropdownItem
                        option={{
                            label: 'Custom',
                            value: 'custom',
                        }}
                        onClick={() => onCustomGuidanceClick()}
                        shouldCloseOnSelect
                    />
                </DropdownBody>
            </UncontrolledDropdown>
        </>
    )
}
