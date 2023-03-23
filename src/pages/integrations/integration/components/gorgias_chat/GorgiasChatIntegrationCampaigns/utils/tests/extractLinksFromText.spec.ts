import {extractLinksFromText} from '../extractLinksFromText'

const HTML_WITH_NO_ANCHORS = `<div>Use code <strong><u>FREE_SHIPPING</u> </strong>and <strong>get 5% off your purchase of $300 </strong>or more.</div>`

const HTML_WITH_ANCHORS = `<div>Use code <strong><u><a href="https://store.com/discount/FREE_SHIPPING" target="_blank" rel="noreferrer noopener">FREE_SHIPPING</a></u> </strong>and <strong>get free shipping for purchases over $300 </strong> or <a href="https://store.com/more-options">more</a>.</div>`

const HTML_WITH_MEDIA = `
  <div>
    <div>
      Use code
      <strong
        ><u
          ><a
            href="https://store.com/discount/FREE_SHIPPING"
            target="_blank"
            rel="noreferrer noopener"
            >FREE_SHIPPING</a
          ></u
        > </strong
      >and <strong>get 5% off your purchase of $300 </strong>or more.
    </div>
    <div data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk"></div>
    <img
      src="https://media.png"
      width="400"
      style="max-width: 100%"
    />
  </div>`

describe('extractLinksFromText()', () => {
    describe('html text has links inside', () => {
        it('extracts the href values as list', () => {
            expect(extractLinksFromText(HTML_WITH_ANCHORS)).toEqual([
                'https://store.com/discount/FREE_SHIPPING',
                'https://store.com/more-options',
            ])
        })
    })

    describe('html text has links and media inside', () => {
        it('extracts only the links values', () => {
            expect(extractLinksFromText(HTML_WITH_MEDIA)).toEqual([
                'https://store.com/discount/FREE_SHIPPING',
            ])
        })
    })

    describe('html text does not have any links inside', () => {
        it('returns an empty list', () => {
            expect(extractLinksFromText(HTML_WITH_NO_ANCHORS)).toEqual([])
        })
    })
})
