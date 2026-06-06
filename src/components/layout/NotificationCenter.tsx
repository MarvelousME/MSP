'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { cn } from '@/lib/utils';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Dashboard synced',
    message: 'Your latest metrics are up to date.',
    time: 'Just now',
    read: false,
  },
  {
    id: '2',
    title: 'Session active',
    message: 'You are securely signed in.',
    time: 'Today',
    read: false,
  },
];

type NotificationCenterProps = {
  accentClass?: string;
};

export function NotificationCenter({ accentClass = 'text-teal-400' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const openNotification = (notification: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    toast.info(notification.title, { description: notification.message });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative text-slate-400 hover:text-teal-400 hover:bg-teal-500/5 rounded-md border border-transparent hover:border-teal-500/20 h-10 w-10 sm:h-11 sm:w-11 transition-all cursor-pointer"
        >
          <AnimatedIcon icon={Bell} className="text-current" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 rounded-md border border-white/10 bg-[#020617]/95 p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-300">Notifications</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="h-8 gap-1.5 text-[13px] font-bold uppercase tracking-wider text-slate-400 hover:text-teal-400"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
        <ul className="max-h-72 overflow-y-auto py-1">
          {notifications.length === 0 ? (
            <li className="px-4 py-8 text-center text-xs text-slate-500">No notifications yet</li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors hover:bg-white/5',
                    !notification.read && 'bg-teal-500/5'
                  )}
                >
                  <p className={cn('text-xs font-bold', accentClass)}>{notification.title}</p>
                  <p className="mt-0.5 text-[14px] text-slate-400 leading-snug">{notification.message}</p>
                  <p className="mt-1 text-[13px] font-mono text-slate-600">{notification.time}</p>
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
