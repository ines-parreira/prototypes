import client from '../api/resources'
import {LanguageDetectResult} from './types'

export const detectLanguage = async (text: string): Promise<string> => {
    const res = await client.post('/api/language/detect/', {text})
    return (res.data as LanguageDetectResult)['language']
}
