import QRCode from "qrcode";
export async function qrSvg(text: string, opts: { color?: string; margin?: number } = {}) {
  return QRCode.toString(text, {
    type: "svg",
    margin: opts.margin ?? 1,
    color: { dark: opts.color ?? "#0a1220", light: "#00000000" },
    errorCorrectionLevel: "M",
  });
}
