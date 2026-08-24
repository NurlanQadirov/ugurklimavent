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
          {i > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}
