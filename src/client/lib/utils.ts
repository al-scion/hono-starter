import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prettyFileType(fileType: string) {
  if (fileType === 'application/pdf') return 'PDF';
  if (fileType === 'image/jpeg') return 'JPEG';
  if (fileType === 'image/png') return 'PNG';
  else return fileType;
}