'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Common');

  function onLocaleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale as any });
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-400" />
      <Select value={locale} onValueChange={onLocaleChange}>
        <SelectTrigger className="w-[120px] bg-slate-900/50 border-slate-800 text-slate-300">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Español</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
