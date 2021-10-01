import {
    getCharCount,
    getDailyMotionSrc,
    getLoomSrc,
    getSrc,
    getVimeoSrc,
    getWordCount,
    getYoutubeSrc,
    isDailyMotion,
    isLoom,
    isVimeo,
    isYoutube,
} from '../utils'

describe('HelpCenter Editor Counters', () => {
    it('should return the correct number of characters', () => {
        expect(getCharCount('Hello World!')).toEqual(12)
        expect(getCharCount('😁😂😃')).toEqual(3)
        expect(getCharCount('Caractères en français')).toEqual(22)
    })

    it('should return the correct number of words', () => {
        expect(getWordCount('Hello there, how are you? 😂')).toEqual(6)
        expect(getWordCount('😁😃')).toEqual(1)
        expect(getWordCount('😁😂, 😃')).toEqual(2)
    })
})

describe('Help center Editor Video', () => {
    it('should recognize youtube videos', () => {
        expect(isYoutube('https://www.youtube.com/watch?v=iNqZZH-Sg6c')).toBe(
            true
        )
        expect(isYoutube('https://www.youtube.com/embed/iNqZZH-Sg6c')).toBe(
            true
        )
        expect(isYoutube('https://www.youtube.com/')).toBe(false)
    })

    it('should recognize loom videos', () => {
        expect(
            isLoom(
                'https://www.loom.com/embed/900d8f5b03df4e6db482fe06de684e09'
            )
        ).toBe(true)
        expect(
            isLoom(
                'https://www.loom.com/share/900d8f5b03df4e6db482fe06de684e09'
            )
        ).toBe(true)
        expect(isLoom('https://www.youtube.com/embed/iNqZZH-Sg6c')).toBe(false)
    })

    it('should recognize daily motion videos', () => {
        expect(
            isDailyMotion(
                'https://www.dailymotion.com/video/x84f8uq?playlist=x6lgtp'
            )
        ).toBe(true)
        expect(
            isDailyMotion(
                'https://www.dailymotion.com/embed/video/x84f8uq?autoplay=1'
            )
        ).toBe(true)
        expect(
            isDailyMotion(
                'https://www.loom.com/share/900d8f5b03df4e6db482fe06de684e09'
            )
        ).toBe(false)
    })

    it('should recognize vimeo videos', () => {
        expect(isVimeo('https://vimeo.com/608932905')).toBe(true)
        expect(
            isVimeo(
                'https://player.vimeo.com/video/608932905?h=533c52bf51&color=ffffff&title=0&byline=0&portrait=0'
            )
        ).toBe(true)
        expect(
            isVimeo(
                'https://www.loom.com/share/900d8f5b03df4e6db482fe06de684e09'
            )
        ).toBe(false)
    })

    it('should return video object', () => {
        expect(
            getYoutubeSrc('https://www.youtube.com/embed/iNqZZH-Sg6c')
        ).toEqual({
            srcID: 'iNqZZH-Sg6c',
            srcType: 'youtube',
            url: 'https://www.youtube.com/embed/iNqZZH-Sg6c',
        })
        expect(
            getLoomSrc(
                'https://www.loom.com/embed/900d8f5b03df4e6db482fe06de684e09'
            )
        ).toEqual({
            srcID: '900d8f5b03df4e6db482fe06de684e09',
            srcType: 'loom',
            url: 'https://www.loom.com/embed/900d8f5b03df4e6db482fe06de684e09',
        })
        expect(
            getDailyMotionSrc(
                'https://www.dailymotion.com/embed/video/x84f8uq?autoplay=1'
            )
        ).toEqual({
            srcID: 'x84f8uq',
            srcType: 'dailyMotion',
            url: 'https://www.dailymotion.com/embed/video/x84f8uq?autoplay=1',
        })
        expect(
            getVimeoSrc('https://player.vimeo.com/video/6089329051')
        ).toEqual({
            srcID: '6089329051',
            srcType: 'vimeo',
            url: 'https://player.vimeo.com/video/6089329051',
        })
    })

    it('should return embedded source', () => {
        expect(
            getSrc({src: 'https://www.youtube.com/watch?v=iNqZZH-Sg6c'})
        ).toEqual('https://www.youtube.com/embed/iNqZZH-Sg6c')
        expect(
            getSrc({
                src:
                    'https://www.loom.com/share/900d8f5b03df4e6db482fe06de684e09',
            })
        ).toEqual('https://www.loom.com/embed/900d8f5b03df4e6db482fe06de684e09')
        expect(
            getSrc({
                src:
                    'https://www.dailymotion.com/video/x84f8uq?playlist=x6lgtp',
            })
        ).toEqual('https://www.dailymotion.com/embed/video/x84f8uq')
        expect(getSrc({src: 'https://vimeo.com/608932905'})).toEqual(
            'https://player.vimeo.com/video/608932905'
        )
    })
})
