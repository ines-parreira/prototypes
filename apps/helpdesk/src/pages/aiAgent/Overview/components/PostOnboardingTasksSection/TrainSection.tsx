import { useRef } from 'react'

import _noop from 'lodash/noop'

import { Text } from '@gorgias/axiom'

import DropdownButton from 'pages/common/components/button/DropdownButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import { PostOnboardingTask } from './types'

import css from './TrainSection.less'

type Props = {
    task: PostOnboardingTask
}
export const TrainSection = ({ task }: Props) => {
    const dropdownButtonRef = useRef<HTMLDivElement>(null)
    const toggleButtonRef = useRef<HTMLButtonElement>(null)

    return (
        <div className={css.container}>
            <div className={css.leftContent}>
                <Text size="md" variant="regular">
                    {task.stepDescription}
                </Text>

                <DropdownButton
                    intent="primary"
                    fillStyle="fill"
                    onClick={_noop}
                    onToggleClick={_noop}
                    size="medium"
                    ref={dropdownButtonRef}
                    toggleRef={toggleButtonRef}
                    customIcon="keyboard_arrow_down"
                >
                    Add Guidance
                </DropdownButton>
                <UncontrolledDropdown
                    target={toggleButtonRef}
                    placement="bottom-end"
                >
                    <DropdownBody>
                        <DropdownItem
                            option={{
                                label: 'Start from template',
                                value: 'start_from_template',
                            }}
                            onClick={_noop}
                            shouldCloseOnSelect
                        />
                    </DropdownBody>
                </UncontrolledDropdown>
            </div>

            <div className={css.rightContent}>
                <img
                    src={task.stepImage}
                    alt="AI Agent training"
                    className={css.image}
                />
            </div>
        </div>
    )
}
