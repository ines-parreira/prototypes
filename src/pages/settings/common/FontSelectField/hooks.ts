import {useEffect, useState} from 'react'
import {useHelpCenterApi} from '../../helpCenter/hooks/useHelpCenterApi'

// TODO. The backend is currently located in the helpcenter. This should be moved elsewhere as the usage of google fonts is not limited to the helpcenter anymore.
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
