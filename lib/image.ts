/**
 * 画像をクライアント側でリサイズ・圧縮する。
 * - 7MB級の写真を ~500KB 程度に縮小（Geminiコスト削減・速度UP）
 * - 元画像の縦横比は保持
 */
export async function resizeImage(
  file: File,
  maxLongEdge = 1600,
  quality = 0.85
): Promise<File> {
  if (typeof window === "undefined") return file;
  // 小さい画像はそのまま
  if (file.size < 500 * 1024) return file;

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);
  const longEdge = Math.max(img.width, img.height);
  const scale = longEdge > maxLongEdge ? maxLongEdge / longEdge : 1;
  const targetW = Math.round(img.width * scale);
  const targetH = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  // 元より大きくなったら元のまま（PNG等で圧縮効果がない場合の保険）
  if (blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** 履歴用の小さなサムネを生成（240px正方形クロップ・JPEG） */
export async function makeThumbnail(file: File, size = 240): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  try {
    const dataUrl = await readAsDataURL(file);
    const img = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    // センタークロップ
    const ratio = Math.min(img.width, img.height);
    const sx = (img.width - ratio) / 2;
    const sy = (img.height - ratio) / 2;
    ctx.drawImage(img, sx, sy, ratio, ratio, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return undefined;
  }
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
