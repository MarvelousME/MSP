'use client';

import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

type ProfileAvatarEditorProps = {
  name?: string;
  value?: string | null;
  onChange: (value: string | null) => void;
  size?: 'md' | 'lg';
  disabled?: boolean;
};

export function ProfileAvatarEditor({
  name = '',
  value,
  onChange,
  size = 'lg',
  disabled = false,
}: ProfileAvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dimension = size === 'lg' ? 'h-32 w-32' : 'h-20 w-20';
  const iconSize = size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result);
    };
    reader.onerror = () => toast.error('Could not read that image');
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative group">
        <Avatar className={`${dimension} rounded-xl border-2 border-white/15 shadow-lg`}>
          <AvatarImage src={value ?? undefined} alt={name} className="object-cover" />
          <AvatarFallback className={`rounded-xl bg-teal-600 text-white ${size === 'lg' ? 'text-3xl' : 'text-xl'} font-bold`}>
            {name?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        {!disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change profile photo"
          >
            <Camera className={`${iconSize} text-white`} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm font-medium text-foreground">Profile photo</p>
        <p className="text-[13px] text-muted-foreground max-w-xs">
          JPG, PNG, or WebP up to 2 MB. Shown in your sidebar and account.
        </p>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            Upload photo
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
