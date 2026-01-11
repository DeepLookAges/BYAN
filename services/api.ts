
import { Surah, PrayerTimes } from '../types';

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const PRAYER_API_BASE = 'https://api.aladhan.com/v1';
const QURAN_COM_API = 'https://api.quran.com/api/v4';

export const fetchSurahs = async (): Promise<Surah[]> => {
  const response = await fetch(`${QURAN_API_BASE}/surah`);
  const data = await response.json();
  return data.data;
};

export const fetchSurahDetail = async (number: number) => {
  const response = await fetch(`${QURAN_API_BASE}/surah/${number}/ar.minshawi`);
  const data = await response.json();
  return data.data;
};

export const fetchTajweedData = async (surahNumber: number) => {
  const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/ar.tajweed`);
  const data = await response.json();
  return data.data.ayahs;
};

export const fetchPrayerTimes = async (lat: number, lng: number): Promise<PrayerTimes> => {
  const date = new Date().toISOString().split('T')[0];
  // Method 5 is Egyptian General Authority of Survey (Cairo)
  const response = await fetch(`${PRAYER_API_BASE}/timings/${date}?latitude=${lat}&longitude=${lng}&method=5`);
  const data = await response.json();
  return data.data.timings;
};

export const fetchTafsir = async (ayahNumber: number) => {
  const response = await fetch(`${QURAN_API_BASE}/ayah/${ayahNumber}/ar.jalalayn`);
  const data = await response.json();
  return data.data;
};

export const fetchTafsirTabari = async (surah: number, ayah: number) => {
  const response = await fetch(`${QURAN_COM_API}/tafsirs/15/by_ayah/${surah}:${ayah}`);
  const data = await response.json();
  return data.tafsir;
};
