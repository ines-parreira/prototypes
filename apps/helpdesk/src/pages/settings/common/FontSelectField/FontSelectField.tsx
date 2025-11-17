import React, { useEffect, useMemo, useState } from 'react'

import uniq from 'lodash/uniq'

import SelectField from '../../../common/forms/SelectField/SelectField'
import SelectFieldDropdownAction from '../../../common/forms/SelectField/SelectFieldDropdownAction'
import type { Option, Value } from '../../../common/forms/SelectField/types'
import {
    FontCatalogueModal,
    getMultipleFontLink,
} from './components/FontCatalogueModal/FontCatalogueModal'
import { AGENT_ADDED_FONTS } from './constants'

import css from './FontSelectField.less'

type Props = {
    value: Value
    defaultFonts: string[]
    placeholder: string
    onChange: (value: string) => void
}

const getOptionFromFontName = (fontName: string) => ({
    value: fontName,
    label: <span style={{ fontFamily: fontName }}>{fontName}</span>,
})

const getFontsFromLocalStorage = (): string[] => {
    const agentAddedFonts = localStorage.getItem(AGENT_ADDED_FONTS)

    return agentAddedFonts ? (JSON.parse(agentAddedFonts) as string[]) : []
}

/**
 * Helper function to install the font(s) in the browser.
 */
export const addLinkToDownloadFonts = (fonts: string[]) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = getMultipleFontLink(fonts)
    document.body.appendChild(link)
}

export const FontSelectField = ({
    value,
    defaultFonts,
    placeholder,
    onChange,
}: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFont, setSelectedFont] = useState(value) as [
        string,
        (value: string) => void,
    ]
    const [fontsFromLocalStorage, setFontsFromLocalStorage] = useState(() =>
        getFontsFromLocalStorage(),
    )

    useEffect(() => {
        if (
            fontsFromLocalStorage.length === 0 &&
            defaultFonts.includes(selectedFont)
        ) {
            return
        }

        void addLinkToDownloadFonts(
            defaultFonts.includes(selectedFont)
                ? fontsFromLocalStorage
                : [...fontsFromLocalStorage, selectedFont],
        )
    }, [fontsFromLocalStorage, selectedFont, defaultFonts])

    const recentlyAddedFonts = defaultFonts.includes(selectedFont)
        ? fontsFromLocalStorage
        : uniq([selectedFont, ...fontsFromLocalStorage])

    const fontOptions: Option[] = useMemo(() => {
        const shouldDisplayHeaders =
            recentlyAddedFonts.length > 1 ||
            (recentlyAddedFonts.length === 1 &&
                selectedFont !== recentlyAddedFonts[0])

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
                { isDivider: true },
                { isHeader: true, label: 'RECENTLY ADDED' },
            )
        }

        displayedOptions.push(
            ...recentlyAddedFonts.map((font) => getOptionFromFontName(font)),
        )

        if (shouldDisplayHeaders) {
            displayedOptions.push(
                { isDivider: true },
                { isHeader: true, label: 'STANDARD FONTS' },
            )
        }

        displayedOptions.push(
            ...defaultFonts.map((font) => getOptionFromFontName(font)),
        )

        return displayedOptions
    }, [recentlyAddedFonts, selectedFont, defaultFonts])

    return (
        <>
            <SelectField
                fullWidth
                placeholder={placeholder}
                value={value}
                onChange={(value) => {
                    onChange(value as string)
                    setSelectedFont(value as string)
                }}
                options={fontOptions}
                dropdownMenuClassName={css.longDropdown}
            />
            <FontCatalogueModal
                recentlyAddedFonts={recentlyAddedFonts}
                setFontsFromLocalStorage={setFontsFromLocalStorage}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                currentPrimaryFont={selectedFont}
            />
        </>
    )
}
