import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export type PdfImageFormat = "jpg" | "png";

/** Embed a JPG or PNG image into a single-page PDF. */
export async function imageToPdf(
  imageBuffer: Buffer,
  inputFormat: PdfImageFormat
): Promise<Buffer> {
  const normalized =
    inputFormat === "jpg"
      ? await sharp(imageBuffer).rotate().jpeg({ quality: 95 }).toBuffer()
      : await sharp(imageBuffer).rotate().png().toBuffer();

  const meta = await sharp(normalized).metadata();
  const width = meta.width || 1;
  const height = meta.height || 1;

  const pdfDoc = await PDFDocument.create();
  const embedded =
    inputFormat === "jpg"
      ? await pdfDoc.embedJpg(normalized)
      : await pdfDoc.embedPng(normalized);

  const page = pdfDoc.addPage([width, height]);
  page.drawImage(embedded, { x: 0, y: 0, width, height });

  return Buffer.from(await pdfDoc.save());
}

/** Render the first page of a PDF to JPG or PNG. */
export async function pdfToImage(
  pdfBuffer: Buffer,
  outputFormat: PdfImageFormat,
  quality = 85
): Promise<Buffer> {
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(pdfBuffer, { scale: 2 });
  const pagePng = await document.getPage(1);
  if (!pagePng?.length) {
    throw new Error("PDF has no pages or could not be rendered.");
  }

  if (outputFormat === "png") {
    return await sharp(pagePng).png().toBuffer();
  }

  return await sharp(pagePng).jpeg({ quality, mozjpeg: true }).toBuffer();
}

export function isPdfConverterPair(
  inputExt: string,
  targetExt: string
): boolean {
  return (
    (["jpg", "png"].includes(inputExt) && targetExt === "pdf") ||
    (inputExt === "pdf" && ["jpg", "png"].includes(targetExt))
  );
}
