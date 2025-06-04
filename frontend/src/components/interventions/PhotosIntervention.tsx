import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, X } from "lucide-react";

interface PhotosInterventionProps {
  interventionId: number;
  photos: string[];
  onPhotosChange: (nouvellesPhotos: string[]) => void;
}

export function PhotosIntervention({ interventionId, photos, onPhotosChange }: PhotosInterventionProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const response = await fetch(`/api/interventions/${interventionId}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement des photos');
      }

      const data = await response.json();
      onPhotosChange([...photos, ...data.photos]);

      toast({
        title: "Succès",
        description: "Les photos ont été téléchargées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger les photos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/interventions/${interventionId}/photos`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photo_url: photoUrl }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la photo');
      }

      onPhotosChange(photos.filter(photo => photo !== photoUrl));

      toast({
        title: "Succès",
        description: "La photo a été supprimée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photos de l'intervention</h3>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            {isUploading ? "Téléchargement..." : "Ajouter des photos"}
          </Button>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => handleDeletePhoto(photo)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucune photo n'a été ajoutée
        </div>
      )}
    </div>
  );
} 