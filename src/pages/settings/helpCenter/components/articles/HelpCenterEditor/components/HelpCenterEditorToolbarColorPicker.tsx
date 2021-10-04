import React, {useState} from 'react'

import ColorField from '../../../../../../common/forms/ColorField.js'

import {HelpCenterEditorToolbarPopoverButton} from './HelpCenterEditorToolbarPopoverButton'

type Props = {
    onChange: (option: 'color', value?: string) => void
    currentState: {
        color: string
    }
}

export const HelpCenterEditorToolbarColorPicker = ({
    currentState,
    onChange,
}: Props): JSX.Element => {
    const [expanded, setExpanded] = useState(false)

    const initialColor = currentState?.color || '#1B1C1D'
    const colors = [
        '#1B1C1D', // black
        '#FFFFFF', // white
        '#EB144C', // red
        '#FF6900', // orange
        '#FCB900', // yellow
        '#B5CC18', // olive
        '#00D084', // green
        '#7BDCB5', // teal
        '#8ED1FC', // light blue
        '#0693E3', // blue
        '#9900EF', // purple
        '#E03997', // pink
        '#F78DA7', // light pink
        '#A5673F', // brown
        '#ABB8C3', // light grey
        '#767676', // grey
    ]

    return (
        <HelpCenterEditorToolbarPopoverButton
            icon="palette"
            tooltip="Color Picker"
            isOpen={expanded}
            onOpen={() => setExpanded(true)}
            onClose={() => setExpanded(false)}
        >
            <div>
                <ColorField
                    value={initialColor}
                    onChange={(value: string) => onChange('color', value)}
                    colors={colors}
                    label="Text"
                />
            </div>
        </HelpCenterEditorToolbarPopoverButton>
    )
}
