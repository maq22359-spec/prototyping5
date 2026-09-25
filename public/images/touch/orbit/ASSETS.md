# Catch Me — orbit sketch assets

Source reference: `/Users/maqianyi/Downloads/5e938756caa7574ea2e894e1f9fbba.JPG`.
Created with the built-in image_gen tool (not CLI). The reference was isolated/reconstructed as transparent artwork; it is not a pixel-identical manual tracing.

- `sketch-atlas.png`: two ghost poses and It's me / Sad... / Anxiety / Please. CSS selects each region without resampling the saved image.
- `fuck-lettering.png`: the remaining handwriting.

## Final editing prompts

Atlas cleanup: “Edit this sprite atlas: remove ALL grey glows, grey haze, drop shadows, and any black background. Outside each isolated drawing and each word must be perfectly transparent alpha=0. Keep the two ghost interiors solid ivory white and the sketch outlines charcoal black. Keep the handwritten It's me / Sad... / Anxiety / Please as dark charcoal graphite strokes only, transparent between strokes. Preserve all six items exactly, shapes, sizes, positions, and pencil texture. No redesign, no rearrangement. Only clean the transparent background around every item, no residual rectangular regions or halo. Actual transparent PNG.”

Separate lettering: “Use case background-extraction. Extract ONLY the handwritten word \"Fuck\" from the lower-left area of the TOP panel of the supplied drawing. Preserve its exact rough black graphite handwriting, uppercase F and lowercase uck. Remove every surrounding scribble and all paper, character and grey shadows. One isolated handwritten word centered with 12% transparent padding in a wide PNG. Actual fully transparent alpha outside the dark pencil strokes. Do not include anything else. No glow or shadow.”

## Video and interaction

The user's supplied gaze video remains the source of every facial frame. `scripts/prepare-gaze-matte.py` produces a packed RGB + exterior-background mask MP4. The webpage samples both halves in one WebGL draw on each decoded seek, preserving synchronization. No face is generated or warped.

The circle around the head is mathematical only; there is no visible orbit line. Its depth controls front/back stacking and scale. Animation sleeps after settling and when the page is hidden; reduced-motion follows without easing. Eye direction is horizontal because the source video contains horizontal gaze.
