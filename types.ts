
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface IqamaOffsets {
  Fajr: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Isha: number;
}

export interface HifzGoal {
  id: string;
  title: string;
  targetDate: string;
  totalVerses: number;
  completedVerses: number[];
  isCompleted: boolean;
}

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
}
