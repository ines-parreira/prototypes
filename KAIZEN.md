# Kaizen

> The Japanese word kaizen means "change for better"
>
> -- <cite>[Wikipedia](https://en.wikipedia.org/wiki/Kaizen)</cite>

This document gathers knowledge about all the various ongoing efforts to
improve the technical side of the JavaScript application that are
not migrations: they don't have a strict timeline.

The scope and complexity of those efforts may vary significantly:
from the long-term architecture changes to library choices.

Please respect those choices making your code contributions but
also, feel free to post your ideas for improvements (in the form of a
PR).

## Turn on the @flow type-checking in the modified files

In the project, you need to have `// @flow` pragma comment at the
beginning of the file for flow to type-check it.

Currently, many files are not type-checked so to improve the
type-safety <ins>turn on the type-check in the files you modified in a PR
(by adding `// @flow` pragma at the top)</ins>.

Turning on the type check may require some additional work
with fixing/writing typing for that file eg. converting `propTypes`
to flow `type`. If turning on the type-check is difficult for a file or
it makes the PR over-bloated then you can decide to skip it.
