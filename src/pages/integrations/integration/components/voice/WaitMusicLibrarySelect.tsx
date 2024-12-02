import {UpdateWaitMusicLibrary} from '@gorgias/api-queries'
import React, {useRef, useState} from 'react'

import {PhoneCountry} from 'models/phoneNumber/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import {
    RINGTONE_AUDIO_FILE_PATHS,
    STATIC_WAIT_MUSIC_LIBRARY,
} from './waitMusicLibraryConstants'
import css from './WaitMusicLibrarySelect.less'

type Props = {
    library?: UpdateWaitMusicLibrary
    onChange: (selectedLibrary: UpdateWaitMusicLibrary) => void
    integrationCountry: PhoneCountry
}

const WaitMusicLibrarySelect = ({
    library,
    onChange,
    integrationCountry,
}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const waitMusicLibrary: UpdateWaitMusicLibrary[] = [
        {
            key: 'ringtone',
            name: 'Ringtone',
            audio_file_path:
                RINGTONE_AUDIO_FILE_PATHS.find(
                    (RINGTONE_AUDIO_FILE_PATHS) =>
                        RINGTONE_AUDIO_FILE_PATHS.country === integrationCountry
                )?.audioFilePath ?? RINGTONE_AUDIO_FILE_PATHS[0].audioFilePath,
        },
        ...STATIC_WAIT_MUSIC_LIBRARY,
    ]
    const selectedLibraryWaitMusic = library ?? waitMusicLibrary[0]

    return (
        <SelectInputBox
            onToggle={setIsDropdownOpen}
            floating={floatingRef}
            ref={targetRef}
            placeholder="Select wait music"
            label={selectedLibraryWaitMusic.name}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isDropdownOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={selectedLibraryWaitMusic.key}
                    >
                        <DropdownBody>
                            {waitMusicLibrary.map((option) => (
                                <DropdownItem
                                    key={option.key}
                                    option={{
                                        label: option.name,
                                        value: option.key,
                                    }}
                                    onClick={() => onChange(option)}
                                    shouldCloseOnSelect
                                    className={css.dropdownItem}
                                >
                                    <div className={css.dropdownText}>
                                        {option.name}
                                    </div>
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default WaitMusicLibrarySelect
