import React, {useEffect, useMemo, useState} from 'react'
import classnames from 'classnames'
import {FormText} from 'reactstrap'
import uniq from 'lodash/uniq'
import {defined} from 'utils'

import SelectField from '../../../../common/forms/SelectField/SelectField'
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
    const currentFont = useState(value)[0] as string
    const [fontsFromLocalStorage, setFontsFromLocalStorage] = useState(() =>
        getFontsFromLocalStorage()
    )

    useEffect(() => {
        if (fontsFromLocalStorage.length === 0) {
            return
        }
        const addLinkToDownloadFonts = () => {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.type = 'text/css'
            link.href = getMultipleFontLink(fontsFromLocalStorage)
            document.body.appendChild(link)
        }

        void addLinkToDownloadFonts()
    }, [fontsFromLocalStorage])

    const recentlyAddedFonts = HELP_CENTER_AVAILABLE_FONTS.includes(currentFont)
        ? fontsFromLocalStorage
        : uniq([currentFont, ...fontsFromLocalStorage])

    const fontOptions: Option[] = useMemo(
        () => [
            {
                isAction: true,
                label: (
                    <div className={css.moreFontsAction}>
                        <i
                            className={classnames(
                                css.moreFontsIcon,
                                'material-icons mr-2'
                            )}
                        >
                            add
                        </i>
                        <div>More fonts</div>
                    </div>
                ),
                onClick: () => {
                    setIsModalOpen(true)
                },
            },
            {isDivider: true},
            {isHeader: true, label: 'Recently added'},
            ...recentlyAddedFonts.map((font) => getOptionFromFontName(font)),
            {isDivider: true},
            {isHeader: true, label: 'Standard fonts'},
            ...HELP_CENTER_AVAILABLE_FONTS.map((font) =>
                getOptionFromFontName(font)
            ),
        ],
        [recentlyAddedFonts]
    )

    return (
        <>
            <label className="control-label">{title}</label>
            <SelectField
                fullWidth
                placeholder="Select a primary font"
                value={value}
                onChange={(value) => {
                    onChange(value as string)
                }}
                options={fontOptions}
            />
            {defined(help) && <FormText color="muted">{help}</FormText>}

            <FontCatalogueModal
                recentlyAddedFonts={recentlyAddedFonts}
                setFontsFromLocalStorage={setFontsFromLocalStorage}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </>
    )
}
