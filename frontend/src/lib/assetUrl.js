/**
 * Asset URL helper for the scroll-world cinematic.
 *
 * REACT_APP_WORLD_CDN is a Create React App public env var that is inlined
 * at BUILD time. Set it to the root of your Cloudflare R2 bucket (or any
 * other CDN origin) when building for production so the 33 MB of video and
 * poster images are served from the CDN rather than from the same origin.
 *
 * When the var is unset the helper returns the path unchanged, so a bare
 * clone with the assets checked out under public/world/ keeps working with
 * no configuration at all.
 *
 * The value is intentionally public: these are publicly accessible media
 * assets and the URL appears in every rendered page anyway.
 */

const raw = process.env.REACT_APP_WORLD_CDN || '';

/**
 * The resolved CDN base: trimmed and with any trailing slashes removed.
 * Empty string when no CDN is configured.
 *
 * @type {string}
 */
export const cdnBase = raw.trim().replace(/\/+$/, '');

/**
 * True when a remote CDN origin is configured, false when assets are
 * served from the same origin (bare clone / local dev).
 *
 * @type {boolean}
 */
export const isCdnConfigured = cdnBase.length > 0;

/**
 * Resolve an asset path to a full URL.
 *
 * Rules:
 *  - Already-absolute URLs (http://, https://, //) and data: URIs are
 *    returned unchanged so this function is safe to call on any value.
 *  - When no CDN is configured the path is returned as-is, preserving
 *    the same-origin /world/... paths that work from a bare clone.
 *  - A leading slash on the path is normalised so the join never produces
 *    a double slash.
 *
 * @param {string} path  Relative or absolute asset path.
 * @returns {string}     Resolved URL.
 */
export function worldUrl(path) {
  if (typeof path !== 'string' || path === '') return path;

  // Pass through anything that is already a full URL or a data URI.
  if (/^(https?:|\/\/|data:)/i.test(path)) return path;

  if (!isCdnConfigured) return path;

  // Strip a leading slash from path so cdnBase + '/' + path never doubles up.
  const normalised = path.charAt(0) === '/' ? path.slice(1) : path;
  return `${cdnBase}/${normalised}`;
}
