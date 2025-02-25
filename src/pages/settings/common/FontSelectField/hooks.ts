import { useEffect, useState } from 'react'

import { useHelpCenterApi } from '../../helpCenter/hooks/useHelpCenterApi'

/**
 * These fonts are hidden from the font catalog because they are really absurd.
 */
const BANNED_FONTS = [
    'Bungee Spice', // AC/DC🤘🏼 yellow font.
    'Nabla', // AC/DC🤘🏼 yellow font.
    'Flow Block', // Not text.
    'Flow Rounded', // Not text.
    'Flow Circular', // Not text.
    'Redacted', // Not text.
    'Redacted Script', // Not text.
]

type Font = { family: string; category: string }

// TODO. The backend is currently located in the helpcenter. This should be moved elsewhere as the usage of google fonts is not limited to the helpcenter anymore.
export const useGoogleFonts = (): {
    googleFonts: Font[]
} => {
    const [googleFonts, setGoogleFonts] = useState<Font[]>([])
    const { client } = useHelpCenterApi()

    useEffect(() => {
        const getGoogleFontList = async () => {
            if (client) {
                const response = await client.listGoogleFonts()
                setGoogleFonts(
                    (response.data as Font[]).filter(
                        (font: Font) =>
                            !BANNED_FONTS.includes(font.family) &&
                            !font.family.startsWith('Material Icons') && // Material icons are not fonts.
                            !font.family.startsWith('Material Symbols'), // Material symbols are not fonts.
                    ),
                )
            }
        }

        void getGoogleFontList()
    }, [client])

    return {
        googleFonts,
    }
}
