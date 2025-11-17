import { useRef, useState } from 'react'

import type { VoiceQueueWaitMusicLibrary } from '@gorgias/helpdesk-queries'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import CircularAudioPlayer from './CircularAudioPlayer'
import { WAIT_MUSIC_LIBRARY } from './waitMusicLibraryConstants'

import css from './WaitMusicLibrarySelect.less'

type Props = {
    library?: VoiceQueueWaitMusicLibrary
    onChange: (selectedLibrary: VoiceQueueWaitMusicLibrary) => void
}

const WaitMusicLibrarySelect = ({ library, onChange }: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [activeAudioPlayer, setActiveAudioPlayer] = useState<string | null>(
        null,
    )

    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const selectedLibraryWaitMusic = library ?? WAIT_MUSIC_LIBRARY[0]

    const selectedLabel = WAIT_MUSIC_LIBRARY.find(
        (option) =>
            option.audio_file_path === selectedLibraryWaitMusic.audio_file_path,
    )?.name

    return (
        <SelectInputBox
            onToggle={setIsDropdownOpen}
            floating={floatingRef}
            ref={targetRef}
            placeholder="Select wait music"
            label={selectedLabel}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isDropdownOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={selectedLibraryWaitMusic.audio_file_path}
                    >
                        <DropdownBody>
                            {WAIT_MUSIC_LIBRARY.map((option) => (
                                <DropdownItem
                                    key={option.audio_file_path}
                                    option={{
                                        label: option.name,
                                        value: option.audio_file_path,
                                    }}
                                    onClick={() => onChange(option)}
                                    shouldCloseOnSelect
                                    className={css.dropdownItem}
                                >
                                    <CircularAudioPlayer
                                        src={option.audio_file_path}
                                        isActive={
                                            activeAudioPlayer === option.key
                                        }
                                        onPlay={() =>
                                            setActiveAudioPlayer(option.key)
                                        }
                                    />
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
