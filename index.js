/**
 * Host half of the avatar-frame bundle.
 *
 * The whole feature lives in the browser: the Client module draws the avatar
 * beside every assistant reply, keeps the chosen image in this device's local
 * storage, and crops uploads with a canvas. No Host service, tool, or session
 * event is involved, so this entry only carries the bundle row.
 */
export function apply() {}
