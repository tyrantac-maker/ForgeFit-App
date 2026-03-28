export interface Country {
  name: string;
  code: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', code: 'AF', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', flag: '🇩🇿' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹' },
  { name: 'Bahrain', code: 'BH', flag: '🇧🇭' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪' },
  { name: 'Bolivia', code: 'BO', flag: '🇧🇴' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Chile', code: 'CL', flag: '🇨🇱' },
  { name: 'China', code: 'CN', flag: '🇨🇳' },
  { name: 'Colombia', code: 'CO', flag: '🇨🇴' },
  { name: 'Croatia', code: 'HR', flag: '🇭🇷' },
  { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹' },
  { name: 'Finland', code: 'FI', flag: '🇫🇮' },
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭' },
  { name: 'Great Britain', code: 'GB', flag: '🇬🇧' },
  { name: 'Greece', code: 'GR', flag: '🇬🇷' },
  { name: 'Hong Kong', code: 'HK', flag: '🇭🇰' },
  { name: 'Hungary', code: 'HU', flag: '🇭🇺' },
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩' },
  { name: 'Iran', code: 'IR', flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', flag: '🇮🇶' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹' },
  { name: 'Jamaica', code: 'JM', flag: '🇯🇲' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { name: 'Jordan', code: 'JO', flag: '🇯🇴' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼' },
  { name: 'Lebanon', code: 'LB', flag: '🇱🇧' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
  { name: 'Peru', code: 'PE', flag: '🇵🇪' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭' },
  { name: 'Poland', code: 'PL', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦' },
  { name: 'Romania', code: 'RO', flag: '🇷🇴' },
  { name: 'Russia', code: 'RU', flag: '🇷🇺' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
  { name: 'Taiwan', code: 'TW', flag: '🇹🇼' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷' },
  { name: 'UAE', code: 'AE', flag: '🇦🇪' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬' },
  { name: 'Ukraine', code: 'UA', flag: '🇺🇦' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'Venezuela', code: 'VE', flag: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
  { name: 'Zimbabwe', code: 'ZW', flag: '🇿🇼' },
];

export interface Language {
  name: string;
  nativeName: string;
  code: string;
  speechCode: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { name: 'English', nativeName: 'English', code: 'en', speechCode: 'en-GB', flag: '🇬🇧' },
  { name: 'English (US)', nativeName: 'English (US)', code: 'en-US', speechCode: 'en-US', flag: '🇺🇸' },
  { name: 'Arabic', nativeName: 'العربية', code: 'ar', speechCode: 'ar-SA', flag: '🇸🇦' },
  { name: 'Chinese (Simplified)', nativeName: '中文', code: 'zh', speechCode: 'zh-CN', flag: '🇨🇳' },
  { name: 'Dutch', nativeName: 'Nederlands', code: 'nl', speechCode: 'nl-NL', flag: '🇳🇱' },
  { name: 'French', nativeName: 'Français', code: 'fr', speechCode: 'fr-FR', flag: '🇫🇷' },
  { name: 'German', nativeName: 'Deutsch', code: 'de', speechCode: 'de-DE', flag: '🇩🇪' },
  { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi', speechCode: 'hi-IN', flag: '🇮🇳' },
  { name: 'Italian', nativeName: 'Italiano', code: 'it', speechCode: 'it-IT', flag: '🇮🇹' },
  { name: 'Japanese', nativeName: '日本語', code: 'ja', speechCode: 'ja-JP', flag: '🇯🇵' },
  { name: 'Korean', nativeName: '한국어', code: 'ko', speechCode: 'ko-KR', flag: '🇰🇷' },
  { name: 'Polish', nativeName: 'Polski', code: 'pl', speechCode: 'pl-PL', flag: '🇵🇱' },
  { name: 'Portuguese', nativeName: 'Português', code: 'pt', speechCode: 'pt-PT', flag: '🇵🇹' },
  { name: 'Russian', nativeName: 'Русский', code: 'ru', speechCode: 'ru-RU', flag: '🇷🇺' },
  { name: 'Spanish', nativeName: 'Español', code: 'es', speechCode: 'es-ES', flag: '🇪🇸' },
  { name: 'Thai', nativeName: 'ไทย', code: 'th', speechCode: 'th-TH', flag: '🇹🇭' },
  { name: 'Turkish', nativeName: 'Türkçe', code: 'tr', speechCode: 'tr-TR', flag: '🇹🇷' },
  { name: 'Vietnamese', nativeName: 'Tiếng Việt', code: 'vi', speechCode: 'vi-VN', flag: '🇻🇳' },
];

export const GYM_CHAINS_BY_COUNTRY: Record<string, string[]> = {
  GB: ['PureGym', 'The Gym Group', 'Anytime Fitness', 'JD Gyms', 'David Lloyd', 'Nuffield Health', 'DW Fitness First', 'Virgin Active', 'Better (GLL)', 'Snap Fitness', 'Energie Fitness', 'Total Fitness', 'Bannatyne Health Club'],
  US: ['Planet Fitness', 'LA Fitness', "Gold's Gym", '24 Hour Fitness', 'Anytime Fitness', 'Crunch Fitness', 'Equinox', 'YMCA', 'Lifetime Fitness', 'Snap Fitness', 'EōS Fitness', 'YouFit', 'UFC Gym'],
  AU: ['Anytime Fitness', 'Goodlife Health Clubs', 'Fitness First', 'F45 Training', 'Snap Fitness', '24/7 Fitness', 'Genesis Health + Fitness', 'Plus Fitness', 'Virgin Active'],
  CA: ['Goodlife Fitness', 'YMCA', 'Anytime Fitness', 'LA Fitness', 'Planet Fitness', 'World Gym', 'Gold\'s Gym', 'Snap Fitness'],
  IE: ['PureGym', 'Anytime Fitness', 'Westwood Fitness', 'FLYEfit', 'Citywest Leisure', 'Energie Fitness'],
  DE: ['Fitness First', 'McFIT', 'FitX', 'Clever fit', 'John Reed', 'ELBGYM', 'Holmes Place'],
  FR: ['Fitness Park', 'Basic-Fit', 'Neoness', 'Club Med Gym', 'L\'Orange Bleue', 'Keep Cool'],
  ES: ['Anytime Fitness', 'Holmes Place', 'DiR', 'Fitness First', 'McFIT', 'Viva Gym'],
  IT: ['Virgin Active', 'Anytime Fitness', 'McFIT', 'Fitness First', 'Holmes Place', 'World Class'],
  IN: ['Cult.fit', "Gold's Gym", 'Anytime Fitness', 'Snap Fitness', 'Fitness First', 'Talwalkars', 'VLCC Fitness'],
  AE: ['Fitness First', 'Gold\'s Gym', 'Warehouse Gym', 'Vogue Fitness', 'Nuffield Health', 'GymNation', 'Yas Athletic Club'],
  SA: ['Fitness Time', 'Gold\'s Gym', 'Shapes', 'Flex Gym', 'New Life Gym'],
  NZ: ['Les Mills', 'Anytime Fitness', 'Snap Fitness', 'CityFitness', 'YMCA'],
  ZA: ['Planet Fitness', 'Virgin Active', 'Anytime Fitness', 'Gym Company', 'FitnessZone'],
  SG: ['Anytime Fitness', 'Virgin Active', 'Fitness First', 'True Fitness', 'California Fitness'],
  BR: ['SmartFit', 'Bio Ritmo', 'Bodytech', 'Bluefit', 'Academia Contém 1g'],
  JP: ['Anytime Fitness', 'Tipness', 'Konami Sports Club', 'Golds Gym Japan', 'Curves'],
};

export function getGymChains(countryCode: string): string[] {
  return GYM_CHAINS_BY_COUNTRY[countryCode] || [];
}

export const WORKOUT_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    setComplete: 'Set complete! Good work.',
    restComplete: 'Rest complete. Get ready for your next set.',
    workoutComplete: 'Congratulations! Workout complete!',
    repFailure: 'Rep failure logged. Take your time.',
    countdown5: 'Five', countdown4: 'Four', countdown3: 'Three', countdown2: 'Two', countdown1: 'One', countdown0: 'Go!',
  },
  es: {
    setComplete: '¡Serie completa! Buen trabajo.',
    restComplete: 'Descanso terminado. Prepárate para tu próxima serie.',
    workoutComplete: '¡Felicitaciones! ¡Entrenamiento completo!',
    repFailure: 'Repetición fallida registrada. Tómate tu tiempo.',
    countdown5: 'Cinco', countdown4: 'Cuatro', countdown3: 'Tres', countdown2: 'Dos', countdown1: 'Uno', countdown0: '¡Vamos!',
  },
  fr: {
    setComplete: 'Série terminée! Bon travail.',
    restComplete: 'Repos terminé. Préparez-vous pour votre prochaine série.',
    workoutComplete: 'Félicitations! Entraînement terminé!',
    repFailure: 'Répétition échouée enregistrée. Prenez votre temps.',
    countdown5: 'Cinq', countdown4: 'Quatre', countdown3: 'Trois', countdown2: 'Deux', countdown1: 'Un', countdown0: 'Allez!',
  },
  de: {
    setComplete: 'Satz abgeschlossen! Gute Arbeit.',
    restComplete: 'Pause vorbei. Bereit für deinen nächsten Satz.',
    workoutComplete: 'Glückwunsch! Training abgeschlossen!',
    repFailure: 'Wiederholung fehlgeschlagen. Lass dir Zeit.',
    countdown5: 'Fünf', countdown4: 'Vier', countdown3: 'Drei', countdown2: 'Zwei', countdown1: 'Eins', countdown0: 'Los!',
  },
  pt: {
    setComplete: 'Série completa! Bom trabalho.',
    restComplete: 'Descanso completo. Prepare-se para a próxima série.',
    workoutComplete: 'Parabéns! Treino completo!',
    repFailure: 'Repetição falhada registrada. Leve o seu tempo.',
    countdown5: 'Cinco', countdown4: 'Quatro', countdown3: 'Três', countdown2: 'Dois', countdown1: 'Um', countdown0: 'Vai!',
  },
  ar: {
    setComplete: 'اكتملت المجموعة! عمل جيد.',
    restComplete: 'انتهت الراحة. استعد للمجموعة التالية.',
    workoutComplete: 'تهانينا! اكتمل التمرين!',
    repFailure: 'تم تسجيل فشل التكرار. خذ وقتك.',
    countdown5: 'خمسة', countdown4: 'أربعة', countdown3: 'ثلاثة', countdown2: 'اثنان', countdown1: 'واحد', countdown0: 'انطلق!',
  },
  hi: {
    setComplete: 'सेट पूरा हुआ! अच्छा काम.',
    restComplete: 'आराम पूरा हुआ। अपने अगले सेट के लिए तैयार हो जाइए।',
    workoutComplete: 'बधाई हो! वर्कआउट पूरा हुआ!',
    repFailure: 'रेप विफलता दर्ज की गई। अपना समय लें।',
    countdown5: 'पांच', countdown4: 'चार', countdown3: 'तीन', countdown2: 'दो', countdown1: 'एक', countdown0: 'जाओ!',
  },
  it: {
    setComplete: 'Serie completata! Ottimo lavoro.',
    restComplete: 'Riposo completato. Preparati per la prossima serie.',
    workoutComplete: 'Congratulazioni! Allenamento completato!',
    repFailure: 'Ripetizione fallita registrata. Prenditi il tuo tempo.',
    countdown5: 'Cinque', countdown4: 'Quattro', countdown3: 'Tre', countdown2: 'Due', countdown1: 'Uno', countdown0: 'Via!',
  },
  nl: {
    setComplete: 'Set voltooid! Goed werk.',
    restComplete: 'Rust voorbij. Maak je klaar voor je volgende set.',
    workoutComplete: 'Gefeliciteerd! Training voltooid!',
    repFailure: 'Rep mislukking gelogd. Neem je tijd.',
    countdown5: 'Vijf', countdown4: 'Vier', countdown3: 'Drie', countdown2: 'Twee', countdown1: 'Één', countdown0: 'Go!',
  },
  pl: {
    setComplete: 'Seria ukończona! Dobra robota.',
    restComplete: 'Odpoczynek zakończony. Przygotuj się do następnej serii.',
    workoutComplete: 'Gratulacje! Trening ukończony!',
    repFailure: 'Niepowodzenie powtórzenia zarejestrowane. Weź swój czas.',
    countdown5: 'Pięć', countdown4: 'Cztery', countdown3: 'Trzy', countdown2: 'Dwa', countdown1: 'Jeden', countdown0: 'Dalej!',
  },
  ru: {
    setComplete: 'Подход завершён! Хорошая работа.',
    restComplete: 'Отдых завершён. Готовься к следующему подходу.',
    workoutComplete: 'Поздравляем! Тренировка завершена!',
    repFailure: 'Повторение не засчитано. Не спеши.',
    countdown5: 'Пять', countdown4: 'Четыре', countdown3: 'Три', countdown2: 'Два', countdown1: 'Один', countdown0: 'Вперёд!',
  },
  tr: {
    setComplete: 'Set tamamlandı! Güzel iş.',
    restComplete: 'Dinlenme bitti. Bir sonraki setine hazır ol.',
    workoutComplete: 'Tebrikler! Antrenman tamamlandı!',
    repFailure: 'Tekrar başarısız kaydedildi. Zaman al.',
    countdown5: 'Beş', countdown4: 'Dört', countdown3: 'Üç', countdown2: 'İki', countdown1: 'Bir', countdown0: 'Haydi!',
  },
  zh: {
    setComplete: '组数完成！干得好。',
    restComplete: '休息完毕。准备好下一组。',
    workoutComplete: '恭喜！训练完成！',
    repFailure: '动作失败已记录。慢慢来。',
    countdown5: '五', countdown4: '四', countdown3: '三', countdown2: '二', countdown1: '一', countdown0: '开始！',
  },
  ja: {
    setComplete: 'セット完了！よくできました。',
    restComplete: '休憩終了。次のセットの準備をしてください。',
    workoutComplete: 'おめでとう！ワークアウト完了！',
    repFailure: 'レップ失敗を記録しました。ゆっくりどうぞ。',
    countdown5: '五', countdown4: '四', countdown3: '三', countdown2: '二', countdown1: '一', countdown0: 'スタート！',
  },
  ko: {
    setComplete: '세트 완료! 잘 했어요.',
    restComplete: '휴식 완료. 다음 세트 준비하세요.',
    workoutComplete: '축하합니다! 운동 완료!',
    repFailure: '반복 실패 기록됨. 천천히 하세요.',
    countdown5: '다섯', countdown4: '넷', countdown3: '셋', countdown2: '둘', countdown1: '하나', countdown0: '시작!',
  },
};

export function getTranslation(langCode: string, key: string): string {
  const lang = langCode?.split('-')[0] || 'en';
  const translations = WORKOUT_TRANSLATIONS[lang] || WORKOUT_TRANSLATIONS['en'];
  return translations[key] || WORKOUT_TRANSLATIONS['en'][key] || key;
}
