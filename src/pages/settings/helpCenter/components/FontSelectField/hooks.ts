import {useEffect, useState} from 'react'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'

export const useGoogleFonts = (): {
    googleFonts: {family: string; category: string}[]
} => {
    const [googleFonts, setGoogleFonts] = useState<
        {family: string; category: string}[]
    >([])
    const {client} = useHelpCenterApi()

    useEffect(() => {
        const getGoogleFontList = async () => {
            if (client) {
                const response = await client.listGoogleFonts()
                setGoogleFonts(response.data)
            }
        }

        void getGoogleFontList()
    }, [client])

    return {
        googleFonts,
    }
}
