import { useAuthStore } from '../store/authStore';
import { getUIText, TranslationKey } from '../i18n/translations';

export function useTranslation() {
  const user = useAuthStore((state) => state.user);
  const lang = user?.preferred_language || 'en';

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return getUIText(lang, key, params);
  };

  return { t, lang };
}
