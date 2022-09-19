import React, {useEffect, useMemo, useState} from 'react'
import {FormText} from 'reactstrap'
import uniq from 'lodash/uniq'
import {defined} from 'utils'

import SelectField from '../../../../common/forms/SelectField/SelectField'
import SelectFieldDropdownAction from '../../../../common/forms/SelectField/SelectFieldDropdownAction'
import {Value, Option} from '../../../../common/forms/SelectField/types'
import {HELP_CENTER_AVAILABLE_FONTS} from '../../constants'
import css from './FontSelectField.less'
import {
    FontCatalogueModal,
    getMultipleFontLink,
} from './components/FontCatalogueModal/FontCatalogueModal'
import {AGENT_ADDED_FONTS} from './constants'

type Props = {
    title: string
    help?: string
    value: Value
    onChange: (value: string) => void
}

const getOptionFromFontName = (fontName: string) => ({
    value: fontName,
    label: <span style={{fontFamily: fontName}}>{fontName}</span>,
})

const getFontsFromLocalStorage = (): string[] => {
    const agentAddedFonts = localStorage.getItem(AGENT_ADDED_FONTS)

    return agentAddedFonts ? (JSON.parse(agentAddedFonts) as string[]) : []
}

export const FontSelectField = ({title, help, value, onChange}: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPrimaryFont, setCurrentPrimaryFont] = useState(value) as [
        string,
        (value: string) => void
    ]
    const [fontsFromLocalStorage, setFontsFromLocalStorage] = useState(() =>
        getFontsFromLocalStorage()
    )

    useEffect(() => {
        if (
            fontsFromLocalStorage.length === 0 &&
            HELP_CENTER_AVAILABLE_FONTS.includes(currentPrimaryFont)
        ) {
            return
        }
        const addLinkToDownloadFonts = () => {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.type = 'text/css'
            link.href = getMultipleFontLink(
                HELP_CENTER_AVAILABLE_FONTS.includes(currentPrimaryFont)
                    ? fontsFromLocalStorage
                    : [...fontsFromLocalStorage, currentPrimaryFont]
            )
            document.body.appendChild(link)
        }

        void addLinkToDownloadFonts()
    }, [fontsFromLocalStorage, currentPrimaryFont])

    const recentlyAddedFonts = HELP_CENTER_AVAILABLE_FONTS.includes(
        currentPrimaryFont
    )
        ? fontsFromLocalStorage
        : uniq([currentPrimaryFont, ...fontsFromLocalStorage])

    const fontOptions: Option[] = useMemo(() => {
        const shouldDisplayHeaders =
            recentlyAddedFonts.length > 1 ||
            (recentlyAddedFonts.length === 1 &&
                currentPrimaryFont !== recentlyAddedFonts[0])

        const displayedOptions: Option[] = [
            {
                isAction: true,
                label: (
                    <SelectFieldDropdownAction
                        icon={<i className="material-icons">add</i>}
                    >
                        <span>More fonts</span>
                    </SelectFieldDropdownAction>
                ),
                onClick: () => {
                    setIsModalOpen(true)
                },
            },
        ]

        if (shouldDisplayHeaders) {
            displayedOptions.push(
                {isDivider: true},
                {isHeader: true, label: 'RECENTLY ADDED'}
            )
        }

        displayedOptions.push(
            ...recentlyAddedFonts.map((font) => getOptionFromFontName(font))
        )

        if (shouldDisplayHeaders) {
            displayedOptions.push(
                {isDivider: true},
                {isHeader: true, label: 'STANDARD FONTS'}
            )
        }

        displayedOptions.push(
            ...HELP_CENTER_AVAILABLE_FONTS.map((font) =>
                getOptionFromFontName(font)
            )
        )

        return displayedOptions
    }, [recentlyAddedFonts, currentPrimaryFont])

    return (
        <>
            <label className="control-label">{title}</label>
            <SelectField
                fullWidth
                placeholder="Select a primary font"
                value={value}
                onChange={(value) => {
                    onChange(value as string)
                    setCurrentPrimaryFont(value as string)
                }}
                options={fontOptions}
                dropdownMenuClassName={css.longDropdown}
            />
            {defined(help) && <FormText color="muted">{help}</FormText>}

            <FontCatalogueModal
                recentlyAddedFonts={recentlyAddedFonts}
                setFontsFromLocalStorage={setFontsFromLocalStorage}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                currentPrimaryFont={currentPrimaryFont}
            />
        </>
    )
}
