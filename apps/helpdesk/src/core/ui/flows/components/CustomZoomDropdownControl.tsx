import type React from 'react'
import { useMemo, useRef } from 'react'

import { useReactFlow, useViewport } from '@xyflow/react'

import { LegacyButton as Button } from '@gorgias/axiom'

import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import css from './CustomControls.less'

export function CustomZoomDropdownControl(): React.JSX.Element {
    const dropdownTargetRef = useRef<HTMLButtonElement>(null)
    const zoomOptions = useMemo(
        () => [
            { label: '150%', value: 1.5 },
            { label: '125%', value: 1.25 },
            { label: '100%', value: 1 },
            { label: '75%', value: 0.75 },
            { label: '50%', value: 0.5 },
            { label: '25%', value: 0.25 },
            { label: '10%', value: 0.1 },
        ],
        [],
    )
    const { zoom } = useViewport()
    const { zoomTo } = useReactFlow()

    return (
        <>
            <Button
                intent={'secondary'}
                fillStyle="ghost"
                size="medium"
                ref={dropdownTargetRef}
                className={css.zoomDropdown}
                trailingIcon={'arrow_drop_down'}
            >
                {Math.round(zoom * 100)}%
            </Button>

            <UncontrolledDropdown
                target={dropdownTargetRef}
                placement="bottom-end"
            >
                <DropdownBody>
                    {zoomOptions.map((option) => (
                        <DropdownItem
                            key={option.value}
                            option={option}
                            onClick={() => zoomTo(option.value)}
                            shouldCloseOnSelect
                        />
                    ))}
                </DropdownBody>
            </UncontrolledDropdown>
        </>
    )
}
