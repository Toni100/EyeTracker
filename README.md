EyeTracker
==========

EyeTracker tracks eyes in a video, in real-time.

It does so by first finding eye candidates. An eye candidate consists of a white spot, surrounded by darkness (iris), then whiteness (sclera). Extended clusters of eye candidates are discarded, small ones are considered a match for an eye.
