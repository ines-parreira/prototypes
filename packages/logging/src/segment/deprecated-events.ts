/**
 * This file contains a list of deprecated Segment events.
 * This is used to prevent events from being sent to Segment in a two step process:
 *
 * 1. Add the event to the list in this file which will stop it from being sent to Segment, while retaining the
 * events callsites in the codebase if we need to re-enable it.
 * 2. Once the deprecation time buffer has passed, remove the event from the list and the codebase.
 */
import type { SegmentEvent } from './types'

export const deprecatedEvents: SegmentEvent[] = []
