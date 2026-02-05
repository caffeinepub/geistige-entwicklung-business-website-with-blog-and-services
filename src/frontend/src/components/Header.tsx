import { useState } from 'react';
import { Button } from './ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin, useGetSiteContent, useUpdateBusinessTitle } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, User, Shield, Zap, Edit2, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Input } from './ui/input';
import QuickEditOverlay from './QuickEditOverlay';
import { toast } from 'sonner';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: siteContent } = useGetSiteContent();
  const updateBusinessTitle = useUpdateBusinessTitle();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleStartEditTitle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedTitle(siteContent?.businessTitle || 'Geistige Entwicklung');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!editedTitle.trim()) {
      toast.error('Titel darf nicht leer sein');
      return;
    }

    try {
      await updateBusinessTitle.mutateAsync(editedTitle);
      toast.success('Titel erfolgreich aktualisiert');
      setIsEditingTitle(false);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Titels');
      console.error(error);
    }
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isEditingTitle) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <a 
              href="/" 
              className="flex items-center space-x-2"
              onClick={handleLogoClick}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  {siteContent?.businessTitle?.[0]?.toUpperCase() || 'G'}
                </span>
              </div>
              {isEditingTitle && isAdmin ? (
                <div 
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-8 w-40"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveTitle();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelEdit();
                      }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleSaveTitle}
                    disabled={updateBusinessTitle.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="text-xl font-bold">
                    {siteContent?.businessTitle || 'Geistige Entwicklung'}
                  </span>
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleStartEditTitle}
                      title="Inhalt bearbeiten"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickEdit(true)}
                  className="gap-2 hidden sm:flex"
                >
                  <Zap className="h-4 w-4" />
                  Schnellbearbeitung
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/admin' })}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </>
            )}

            {isAuthenticated && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{userProfile.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{userProfile.name}</p>
                    <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAuth}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {!isAuthenticated && (
                  <button
                    onClick={handleAuth}
                    disabled={isLoggingIn}
                    className="w-2 h-2 rounded-full bg-primary/20 hover:bg-primary/40 transition-colors cursor-pointer disabled:opacity-50"
                    title="Admin-Anmeldung"
                    aria-label="Admin-Anmeldung"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {isAdmin && (
        <QuickEditOverlay
          isOpen={showQuickEdit}
          onClose={() => setShowQuickEdit(false)}
        />
      )}
    </>
  );
}
