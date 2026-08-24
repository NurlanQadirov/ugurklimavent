/**
 * Emits one `application/ld+json` block. A Server Component with no state and
 * no client bundle — structured data must be in the HTML the crawler is served,
 * not injected after hydration. Several answer engines fetch without executing
 * JavaScript at all, and Google's rendering queue is not guaranteed to be fast.
 *
 * `<` is escaped rather than the whole payload: JSON is valid inside a
 * `<script>` element except for the literal sequence `</script>`, which would
 * close the tag early and turn the rest of the graph into visible page text.
 * Escaping just `<` is the minimal, lossless fix — a JSON parser turns the
 * `<` escape straight back into `<`.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Not user input — the payload is built from the site's own dictionaries.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
