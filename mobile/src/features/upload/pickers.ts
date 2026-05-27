import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { MIME_TO_SOURCE, validateUploadFile } from "../../constants/upload";
import type { PickedUpload } from "../../types/note";

function inferSourceType(mimeType: string): "pdf" | "image" | "voice" {
  const mapped = MIME_TO_SOURCE[mimeType as keyof typeof MIME_TO_SOURCE];
  if (!mapped) throw new Error("Unsupported file type.");
  return mapped;
}

function toPickedUpload(
  uri: string,
  name: string,
  mimeType: string,
  size: number
): PickedUpload {
  const validationError = validateUploadFile(mimeType, size);
  if (validationError) throw new Error(validationError);

  return {
    uri,
    name,
    mimeType,
    size,
    sourceType: inferSourceType(mimeType)
  };
}

export async function pickPdfOrAudio(): Promise<PickedUpload> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ["application/pdf", "audio/*"]
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error("File selection cancelled.");
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "application/octet-stream";
  const size = asset.size ?? 0;

  return toPickedUpload(asset.uri, asset.name, mimeType, size);
}

export async function pickImage(): Promise<PickedUpload> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Photo library permission is required to pick an image.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error("Image selection cancelled.");
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "image/jpeg";
  const name = asset.fileName ?? `image-${Date.now()}.jpg`;
  const size = asset.fileSize ?? 0;

  return toPickedUpload(asset.uri, name, mimeType, size);
}

export async function pickAudio(): Promise<PickedUpload> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ["audio/*"]
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error("Audio selection cancelled.");
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "audio/mpeg";
  const size = asset.size ?? 0;

  return toPickedUpload(asset.uri, asset.name, mimeType, size);
}
