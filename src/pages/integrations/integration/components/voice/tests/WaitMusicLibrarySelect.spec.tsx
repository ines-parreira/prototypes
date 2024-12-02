import {UpdateWaitMusicLibrary} from '@gorgias/api-queries'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {PhoneCountry} from 'models/phoneNumber/types'

import {STATIC_WAIT_MUSIC_LIBRARY} from '../waitMusicLibraryConstants'
import WaitMusicLibrarySelect from '../WaitMusicLibrarySelect'

describe('<IvrMenuActionSelect />', () => {
    const onChangeMock = jest.fn()
    const renderComponent = (
        selectedLibrary?: UpdateWaitMusicLibrary,
        integrationCountry: PhoneCountry = PhoneCountry.US
    ) => {
        return render(
            <WaitMusicLibrarySelect
                library={selectedLibrary}
                onChange={onChangeMock}
                integrationCountry={integrationCountry}
            />
        )
    }

    it('should render', () => {
        const {getByText} = renderComponent()

        expect(getByText('Ringtone')).toBeInTheDocument()

        fireEvent.click(getByText('arrow_drop_down'))
        expect(getByText('Clockwork Waltz')).toBeInTheDocument()
        expect(getByText('New Frontier')).toBeInTheDocument()
        expect(getByText('The Elevator Bossanova')).toBeInTheDocument()
        expect(getByText('Moonlight Coffee')).toBeInTheDocument()
    })

    it.each(
        STATIC_WAIT_MUSIC_LIBRARY.map((libraryItem) => ({
            libraryName: libraryItem.name,
            expectedLibrary: libraryItem,
        }))
    )(
        'should select correct library audio for $libraryName',
        ({libraryName, expectedLibrary}) => {
            const {getByText} = renderComponent()

            fireEvent.click(getByText('arrow_drop_down'))
            fireEvent.click(getByText(libraryName))
            expect(onChangeMock).toHaveBeenCalledWith(expectedLibrary)
        }
    )

    it.each([
        {
            integrationCountry: PhoneCountry.US,
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/UsRingTone.mp3',
        },
        {
            integrationCountry: PhoneCountry.AU,
            expectedAudioFilePath:
                'https://github.com/msilvestro/custom-wait-music/raw/refs/heads/main/Australia_ringing_tone.mp3',
        },
        {
            integrationCountry: PhoneCountry.GB,
            expectedAudioFilePath:
                'https://github.com/msilvestro/custom-wait-music/raw/refs/heads/main/UK_ringback_tone.mp3',
        },
        {
            integrationCountry: PhoneCountry.CA,
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/UsRingTone.mp3',
        },
    ])(
        'should select correct ringtone for country $integrationCountry',
        ({integrationCountry, expectedAudioFilePath}) => {
            const {getByText} = renderComponent(
                STATIC_WAIT_MUSIC_LIBRARY[0],
                integrationCountry
            )

            fireEvent.click(getByText('arrow_drop_down'))
            fireEvent.click(getByText('Ringtone'))
            expect(onChangeMock).toHaveBeenCalledWith({
                key: 'ringtone',
                name: 'Ringtone',
                audio_file_path: expectedAudioFilePath,
            })
        }
    )
})
