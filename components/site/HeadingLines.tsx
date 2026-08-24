import { Fragment } from "react";

/**
 * Renders a translated heading as the hard-wrapped lines the design calls for,
 * emitting exactly the `line<br />line` markup that was previously written by
 * hand. Each locale decides its own break points in the dictionary, so a longer
 * Russian heading does not have to wrap in the same place as the English one.
 */
export function HeadingLines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {/*
            A real space alongside the break. `<br />` breaks the line visually,
            but it contributes no character to the element's text content — so
            anything that flattens the heading (a plain text extractor, a
            structured-data consumer, the `name` this component's output feeds
            into the JSON-LD graph) reads "Seven disciplines,one accountable
            contractor." A trailing space immediately before a forced break is
            collapsed away by the layout engine, so nothing moves.
          */}
          {i > 0 ? (
            <>
              {" "}
              <br />
            </>
          ) : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}
