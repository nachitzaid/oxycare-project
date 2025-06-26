import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Check, X } from "lucide-react";

interface Notification {
  id: number;
  type: string;
  message: string;
  date: string;
  intervention_id: number;
  lu: boolean;
}

const TYPE_COLORS = {
  rappel: "bg-blue-100 text-blue-800",
  statut: "bg-yellow-100 text-yellow-800",
  erreur: "bg-red-100 text-red-800",
  info: "bg-gray-100 text-gray-800",
};

const TYPE_LABELS = {
  rappel: "Rappel",
  statut: "Changement de statut",
  erreur: "Erreur",
  info: "Information",
};

export function NotificationsInterventions() {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerNotifications();
  }, []);

  const chargerNotifications = async () => {
    try {
      const response = await fetch('/api/interventions/notifications');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLu = async (id: number) => {
    try {
      const response = await fetch(`/api/interventions/notifications/${id}/lu`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la notification');
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, lu: true }
            : notification
        )
      );

      toast({
        title: "Succès",
        description: "Notification marquée comme lue",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la notification",
        variant: "destructive",
      });
    }
  };

  const supprimerNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/interventions/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la notification');
      }

      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );

      toast({
        title: "Succès",
        description: "Notification supprimée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive",
      });
    }
  };

  const nonLues = notifications.filter(n => !n.lu).length;

  if (loading) {
    return <div className="text-center py-8">Chargement des notifications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notifications</h3>
          {nonLues > 0 && (
            <Badge variant="secondary">{nonLues} non lue{nonLues > 1 ? 's' : ''}</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucune notification
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.lu ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge className={TYPE_COLORS[notification.type as keyof typeof TYPE_COLORS]}>
                      {TYPE_LABELS[notification.type as keyof typeof TYPE_LABELS]}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(notification.date), "PPP", { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm">{notification.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.lu && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => marquerCommeLu(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => supprimerNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {notification.intervention_id && (
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto text-sm"
                  onClick={() => router.push(`/interventions/${notification.intervention_id}`)}
                >
                  Voir l'intervention
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}